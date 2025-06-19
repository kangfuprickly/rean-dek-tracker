
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { gradeOptions, monthOptions, getClassroomOptions } from '@/constants/exportOptions';

interface ExportFormProps {
  selectedGrade: string;
  selectedClassroom: string;
  selectedMonth: string;
  selectedYear: string;
  onGradeChange: (value: string) => void;
  onClassroomChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
}

export default function ExportForm({
  selectedGrade,
  selectedClassroom,
  selectedMonth,
  selectedYear,
  onGradeChange,
  onClassroomChange,
  onMonthChange,
  onYearChange
}: ExportFormProps) {
  const classroomOptions = getClassroomOptions(selectedGrade);

  const resetSelections = () => {
    onClassroomChange('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Grade Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ระดับชั้น
          </label>
          <Select value={selectedGrade} onValueChange={(value) => {
            onGradeChange(value);
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
            onValueChange={onClassroomChange}
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
          <Select value={selectedMonth} onValueChange={onMonthChange}>
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
          <Select value={selectedYear} onValueChange={onYearChange}>
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
    </div>
  );
}
