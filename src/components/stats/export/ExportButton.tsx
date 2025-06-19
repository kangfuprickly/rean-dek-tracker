
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateExcelReport } from '@/utils/excelExport';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  selectedGrade: string;
  selectedClassroom: string;
  selectedMonth: string;
  selectedYear: string;
}

export default function ExportButton({
  selectedGrade,
  selectedClassroom,
  selectedMonth,
  selectedYear
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    if (!selectedGrade || !selectedClassroom || !selectedMonth) {
      toast({
        title: "ข้อมูลไม่ครบ",
        description: "กรุณาเลือกชั้นเรียน ห้องเรียน และเดือนที่ต้องการส่งออก",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      const { filename, selectedMonthData } = await generateExcelReport({
        selectedClassroom,
        selectedMonth,
        selectedYear
      });
      
      toast({
        title: "ส่งออกสำเร็จ",
        description: `ส่งออกรายงานสำเร็จ!\nไฟล์: ${filename}\nห้องเรียน: ${selectedClassroom}\nเดือน: ${selectedMonthData.label} ${selectedYear}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งออกรายงาน';
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={!selectedGrade || !selectedClassroom || !selectedMonth || isExporting}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? 'กำลังส่งออก...' : 'ส่งออกรายงานการเช็คชื่อ'}
    </Button>
  );
}
