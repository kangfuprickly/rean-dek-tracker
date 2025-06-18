
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
      // TODO: Implement actual export functionality
      console.log('Exporting data from', startDate, 'to', endDate);
      alert('กำลังพัฒนาฟีเจอร์นี้');
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
          <Download className="w-5 h-5 text-thai-blue-600" />
          ส่งออกข้อมูลสถิติการมาเรียน
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
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'กำลังส่งออก...' : 'ส่งออกข้อมูล Excel'}
        </Button>
      </CardContent>
    </Card>
  );
}
