
import { monthOptions } from '@/constants/exportOptions';

interface ExportPreviewProps {
  selectedGrade: string;
  selectedClassroom: string;
  selectedMonth: string;
  selectedYear: string;
}

export default function ExportPreview({
  selectedGrade,
  selectedClassroom,
  selectedMonth,
  selectedYear
}: ExportPreviewProps) {
  if (!selectedGrade || !selectedClassroom || !selectedMonth) {
    return null;
  }

  const monthLabel = monthOptions.find(m => m.value === selectedMonth)?.label;

  return (
    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
      <p className="text-sm text-blue-800">
        <strong>รายงานที่จะส่งออก:</strong><br />
        ชั้นเรียน: {selectedClassroom}<br />
        เดือน: {monthLabel} {selectedYear}
      </p>
    </div>
  );
}
