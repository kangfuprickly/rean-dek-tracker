import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { getAttendanceDataForExport } from '@/utils/exportData';

export default function ExportDataCard() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด');
      return;
    }

    setIsExporting(true);
    try {
      console.log('Exporting data from', startDate, 'to', endDate);
      
      // Get real attendance data from database
      const attendanceData = await getAttendanceDataForExport(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );
      
      if (attendanceData.length === 0) {
        alert('ไม่พบข้อมูลนักเรียนขาดเรียนในช่วงวันที่ที่เลือก');
        return;
      }

      // Prepare data for Excel - only absent students
      const excelData = attendanceData.map(record => ({
        'วันที่': format(new Date(record.date), 'dd/MM/yyyy'),
        'ห้องเรียน': record.classroom,
        'รหัสนักเรียน': record.studentNumber,
        'ชื่อ-นามสกุล': record.studentName,
        'สถานะ': 'ขาดเรียน',
        'หมายเหตุ': record.reason || '-'
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'รายชื่อนักเรียนขาดเรียน');

      // Generate filename with date range
      const filename = `รายชื่อนักเรียนขาดเรียน_${format(startDate, 'ddMMyyyy')}-${format(endDate, 'ddMMyyyy')}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      alert(`ส่งออกข้อมูลสำเร็จ! พบนักเรียนขาดเรียน ${attendanceData.length} คน ในไฟล์: ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Download className="w-5 h-5 text-purple-600" />
          ส่งออกรายชื่อนักเรียนขาดเรียน
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่เริ่มต้น
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-200",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                  {startDate ? format(startDate, 'dd/MM/yyyy') : <span>เลือกวันที่</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่สิ้นสุด
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 focus:border-purple-600 focus:ring-2 focus:ring-purple-200",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-purple-600" />
                  {endDate ? format(endDate, 'dd/MM/yyyy') : <span>เลือกวันที่</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="pointer-events-auto"
                  disabled={(date) => date > new Date() || (startDate && date < startDate)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button 
          onClick={handleExport}
          disabled={!startDate || !endDate || isExporting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'กำลังส่งออก...' : 'ส่งออกรายชื่อนักเรียนขาดเรียน'}
        </Button>
      </CardContent>
    </Card>
  );
}
