
import * as XLSX from 'xlsx';
import { getAttendanceReportData } from '@/utils/exportData';
import { monthOptions } from '@/constants/exportOptions';

export interface ExportParams {
  selectedClassroom: string;
  selectedMonth: string;
  selectedYear: string;
}

export const generateExcelReport = async ({ selectedClassroom, selectedMonth, selectedYear }: ExportParams) => {
  console.log('Exporting attendance report for:', selectedClassroom, selectedMonth, selectedYear);
  
  const selectedMonthData = monthOptions.find(m => m.value === selectedMonth);
  if (!selectedMonthData) {
    throw new Error('ไม่พบข้อมูลเดือนที่เลือก');
  }

  // Get attendance data for the selected classroom and month
  const attendanceData = await getAttendanceReportData(
    selectedClassroom,
    selectedMonth,
    selectedYear
  );
  
  if (!attendanceData.students || attendanceData.students.length === 0) {
    throw new Error('ไม่พบข้อมูลนักเรียนในห้องเรียนที่เลือก');
  }

  // Convert Buddhist year to Christian year for date key generation
  const christianYear = parseInt(selectedYear) - 543;

  // Create header data
  const headerData = [
    [`ชั้นเรียน: ${selectedClassroom}`],
    [`ประจำเดือน${selectedMonthData.label} ${selectedYear}`],
    [], // Empty row
  ];

  // Create table headers
  const dateHeaders = [];
  for (let day = 1; day <= selectedMonthData.days; day++) {
    dateHeaders.push(day.toString());
  }
  
  const tableHeader = ['ลำดับ', 'รหัส', 'ชื่อ - นามสกุล', ...dateHeaders];
  headerData.push(tableHeader);

  // Create student rows
  const studentRows = attendanceData.students.map((student: any, index: number) => {
    const attendanceRow = [
      index + 1, // ลำดับ
      student.studentNumber, // รหัส
      `${student.firstName} ${student.lastName}` // ชื่อ - นามสกุล
    ];

    // Add attendance status for each day
    for (let day = 1; day <= selectedMonthData.days; day++) {
      const dayString = day.toString().padStart(2, '0');
      // Use Christian year for the date key to match database format
      const dateKey = `${christianYear}-${selectedMonth}-${dayString}`;
      const attendanceRecord = attendanceData.attendance[student.id]?.[dateKey];
      
      console.log(`Student ${student.firstName} ${student.lastName}, Day ${day}, DateKey: ${dateKey}, Record:`, attendanceRecord);
      
      let symbol = ''; // Empty = ยังไม่เช็ค
      if (attendanceRecord) {
        symbol = attendanceRecord.status === 'present' ? '/' : 'x';
      }
      attendanceRow.push(symbol);
    }

    return attendanceRow;
  });

  // Combine all data
  const excelData = [...headerData, ...studentRows];

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 8 },  // ลำดับ
    { wch: 12 }, // รหัส
    { wch: 25 }, // ชื่อ - นามสกุล
    ...Array(selectedMonthData.days).fill({ wch: 4 }) // วันที่
  ];
  ws['!cols'] = colWidths;

  // Style the header rows
  const range = XLSX.utils.decode_range(ws['!ref'] || '');
  for (let row = 0; row <= range.e.r; row++) {
    for (let col = 0; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!ws[cellRef]) continue;

      // Header styling (first 4 rows)
      if (row < 4) {
        ws[cellRef].s = {
          font: { bold: true },
          alignment: { horizontal: 'center' },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      } else {
        // Data rows styling
        let alignment = { horizontal: 'center' };
        if (col === 2) { // ชื่อ - นามสกุล
          alignment = { horizontal: 'left' };
        }

        ws[cellRef].s = {
          alignment,
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      }
    }
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'รายงานการมาเรียน');

  // Generate filename
  const filename = `รายงานการมาเรียน_${selectedClassroom.replace('/', '_')}_${selectedMonthData.label}_${selectedYear}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);
  
  return { filename, selectedMonthData };
};
