
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GRADE_CLASSROOMS, Grade } from '@/types';
import { CheckSquare } from 'lucide-react';

interface ClassroomSelectorProps {
  selectedGrade: Grade | '';
  selectedClassroom: string;
  onGradeChange: (grade: Grade) => void;
  onClassroomChange: (classroom: string) => void;
}

export default function ClassroomSelector({ 
  selectedGrade, 
  selectedClassroom, 
  onGradeChange, 
  onClassroomChange 
}: ClassroomSelectorProps) {
  return (
    <Card className="glass-card mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-thai-blue-600" />
          เลือกห้องเรียน
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ระดับชั้น</label>
          <Select value={selectedGrade} onValueChange={onGradeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="เลือกระดับชั้น" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              {Object.keys(GRADE_CLASSROOMS).map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedGrade && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ห้องเรียน</label>
            <Select value={selectedClassroom} onValueChange={onClassroomChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกห้องเรียน" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {GRADE_CLASSROOMS[selectedGrade].map((classroom) => (
                  <SelectItem key={classroom} value={classroom}>
                    {classroom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
