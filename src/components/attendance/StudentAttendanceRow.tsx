
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Student } from '@/types';

interface StudentAttendanceRowProps {
  student: Student;
  index: number;
  isPresent: boolean;
  hasExistingRecord: boolean;
  onAttendanceChange: (studentId: string, isPresent: boolean) => void;
}

export default function StudentAttendanceRow({ 
  student, 
  index, 
  isPresent, 
  hasExistingRecord, 
  onAttendanceChange 
}: StudentAttendanceRowProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-sm text-gray-500 font-mono w-8">
            {(index + 1).toString().padStart(2, '0')}
          </span>
          <div className="flex-1">
            <p className="font-medium text-gray-800 text-lg">
              {student.firstName} {student.lastName}
            </p>
            {hasExistingRecord && (
              <p className="text-xs text-blue-600 mt-1">
                ✓ มีข้อมูลการเข้าเรียนแล้ว
              </p>
            )}
          </div>
        </div>
        
        <RadioGroup
          value={isPresent ? "present" : "absent"}
          onValueChange={(value) => onAttendanceChange(student.id, value === "present")}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="present" id={`present-${student.id}`} />
            <Label htmlFor={`present-${student.id}`} className="text-sm text-thai-green-600 font-medium cursor-pointer">
              มาเรียน
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="absent" id={`absent-${student.id}`} />
            <Label htmlFor={`absent-${student.id}`} className="text-sm text-red-600 font-medium cursor-pointer">
              ขาดเรียน
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
