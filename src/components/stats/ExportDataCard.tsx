
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getAttendanceReportData } from '@/utils/exportData';

export default function ExportDataCard() {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2568');
  const [isExporting, setIsExporting] = useState(false);

  // Generate grade options (ม.1 to ม.6)
  const gradeOptions = Array.from({ length: 6 }, (_, i) => ({
    value: `ม.${i + 1}`,
    label: `ม.${i + 1}`
  }));

  // Generate classroom options based on selected grade
  const classroomOptions = selectedGrade ? Array.from({ length: 10 }, (_, i) => ({
    value: `${selectedGrade}/${i + 1}`,
    label: `${selectedGrade}/${i + 1}`
  })) : [];

  // Month options in Thai
  const monthOptions = [
    { value: '01', label: 'มกราคม', days: 31 },
    { value: '02', label: 'กุมภาพันธ์', days: 28 },
    { value: '03', label: 'มีนาคม', days: 31 },
    { value: '04', label: 'เมษายน', days: 30 },
    { value: '05', label: 'พฤษภาคม', days: 31 },
    { value: '06', label: 'มิถุนายน', days: 30 },
    { value: '07', label: 'กรกฎาคม', days: 31 },
    { value: '08', label: 'สิงหาคม', days: 31 },
    { value: '09', label: 'กันยายน', days: 30 },
    { value: '10', label: 'ตุลาคม', days: 31 },
    { value: '11', label: 'พฤศจิกายน', days: 30 },
    { value: '12', label: 'ธันวาคม', days: 31 }
  ];

  const handleExport = async () => {
    if (!selectedGrade || !selectedClassroom || !selectedMonth) {
      alert('กรุณาเลือกชั้นเรียน ห้องเรียน และเดือนที่ต้องการส่งออก');
      return;
    }

    setIsExporting(true);
    try {
      console.log('Exporting attendance report for:', selectedClassroom, selectedMonth, selectedYear);
      
      const selectedMonthData = monthOptions.find(m => m.value === selectedMonth);
      if (!selectedMonthData) return;

      // Get attendance data for the selected classroom and month
      const attendanceData = await getAttendanceReportData(
        selectedClassroom,
        selectedMonth,
        selectedYear
      );
      
      if (!attendanceData.students || attendanceData.students.length === 0) {
        alert('ไม่พบข้อมูลนักเรียนในห้องเรียนที่เลือก');
        return;
      }

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
          const dateKey = `${selectedYear}-${selectedMonth}-${dayString}`;
          const attendanceRecord = attendanceData.attendance[student.id]?.[dateKey];
          
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
      const filename = `รายงานการมาเรียน_${selectedGrade.replace('.', '_')}_${selectedClassroom.split('/')[1]}_${selectedMonthData.label}_${selectedYear}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      alert(`ส่งออกรายงานสำเร็จ!\nไฟล์: ${filename}\nห้องเรียน: ${selectedClassroom}\nเดือน: ${selectedMonthData.label} ${selectedYear}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกรายงาน');
    } finally {
      setIsExporting(false);
    }
  };

  const resetSelections = () => {
    setSelectedClassroom('');
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Download className="w-5 h-5 text-purple-600" />
          ส่งออกรายงานการเช็คชื่อ (แบบฟอร์มกระทรวงศึกษาธิการ)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Grade Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ระดับชั้น
            </label>
            <Select value={selectedGrade} onValueChange={(value) => {
              setSelectedGrade(value);
              resetSelections();
            }}>
              <SelectTrigger className="border-2 border-blue-300 hover:border-blue-500 focus:border-blue-600">
                <SelectValue placeholder="เลือกระดับชั้น" />
              </SelectTrigger>
              <SelectContent>
                {gradeOptions.map((grade) => (
                  <SelectItem key={grade.value} value={grade.value}>
                    {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Classroom Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ห้องเรียน
            </label>
            <Select 
              value={selectedClassroom} 
              onValueChange={setSelectedClassroom}
              disabled={!selectedGrade}
            >
              <SelectTrigger className="border-2 border-purple-300 hover:border-purple-500 focus:border-purple-600 disabled:opacity-50">
                <SelectValue placeholder="เลือกห้องเรียน" />
              </SelectTrigger>
              <SelectContent>
                {classroomOptions.map((classroom) => (
                  <SelectItem key={classroom.value} value={classroom.value}>
                    {classroom.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เดือน
            </label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="border-2 border-green-300 hover:border-green-500 focus:border-green-600">
                <SelectValue placeholder="เลือกเดือน" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ปี พ.ศ.
            </label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="border-2 border-orange-300 hover:border-orange-500 focus:border-orange-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2567">2567</SelectItem>
                <SelectItem value="2568">2568</SelectItem>
                <SelectItem value="2569">2569</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview Selection */}
        {selectedGrade && selectedClassroom && selectedMonth && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>รายงานที่จะส่งออก:</strong><br />
              ชั้นเรียน: {selectedClassroom}<br />
              เดือน: {monthOptions.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </p>
          </div>
        )}

        <Button 
          onClick={handleExport}
          disabled={!selectedGrade || !selectedClassroom || !selectedMonth || isExporting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'กำลังส่งออก...' : 'ส่งออกรายงานการเช็คชื่อ'}
        </Button>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">รูปแบบสัญลักษณ์ในรายงาน:</p>
          <p>• <strong>/</strong> = มาเรียน</p>
          <p>• <strong>x</strong> = ขาดเรียน</p>
          <p>• <strong>เว้นว่าง</strong> = ยังไม่เช็ค</p>
        </div>
      </CardContent>
    </Card>
  );
}
