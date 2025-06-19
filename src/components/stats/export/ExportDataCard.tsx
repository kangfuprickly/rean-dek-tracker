
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import ExportForm from './ExportForm';
import ExportPreview from './ExportPreview';
import ExportButton from './ExportButton';
import ExportLegend from './ExportLegend';

export default function ExportDataCard() {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2568');

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Download className="w-5 h-5 text-purple-600" />
          ส่งออกรายงานการเช็คชื่อ (แบบฟอร์มกระทรวงศึกษาธิการ)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ExportForm
          selectedGrade={selectedGrade}
          selectedClassroom={selectedClassroom}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onGradeChange={setSelectedGrade}
          onClassroomChange={setSelectedClassroom}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />

        <ExportPreview
          selectedGrade={selectedGrade}
          selectedClassroom={selectedClassroom}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />

        <ExportButton
          selectedGrade={selectedGrade}
          selectedClassroom={selectedClassroom}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />

        <ExportLegend />
      </CardContent>
    </Card>
  );
}
