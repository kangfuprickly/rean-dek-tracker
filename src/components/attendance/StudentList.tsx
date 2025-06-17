
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Student } from '@/types';
import { Users, Save } from 'lucide-react';
import StudentAttendanceRow from './StudentAttendanceRow';

interface StudentListProps {
  students: Student[];
  selectedClassroom: string;
  selectedDate: Date;
  attendanceData: Record<string, boolean>;
  existingRecords: Record<string, string>;
  isLoading: boolean;
  isLoadingStudents: boolean;
  onAttendanceChange: (studentId: string, isPresent: boolean) => void;
  onSave: () => void;
}

export default function StudentList({ 
  students, 
  selectedClassroom, 
  selectedDate, 
  attendanceData, 
  existingRecords, 
  isLoading, 
  isLoadingStudents,
  onAttendanceChange, 
  onSave 
}: StudentListProps) {
  const presentCount = Object.values(attendanceData).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  // Loading indicator for students
  if (isLoadingStudents) {
    return (
      <div className="text-center py-12">
        <div className="text-thai-blue-600 mb-4">
          <svg className="w-8 h-8 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <p className="text-gray-600">กำลังโหลดรายชื่อนักเรียน...</p>
      </div>
    );
  }

  // Empty state when no students in classroom
  if (selectedClassroom && students.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">ไม่พบรายชื่อนักเรียน</h3>
          <p className="text-gray-600">ห้องเรียน {selectedClassroom} ยังไม่มีรายชื่อนักเรียน</p>
          <p className="text-sm text-gray-500 mt-2">กรุณานำเข้าข้อมูลนักเรียนจากหน้า "นำเข้าข้อมูล"</p>
        </CardContent>
      </Card>
    );
  }

  // Student list with attendance
  if (students.length > 0) {
    return (
      <>
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-thai-green-600" />
              รายชื่อนักเรียน {selectedClassroom}
            </CardTitle>
            <div className="flex gap-4 text-sm text-gray-600">
              <span className="text-thai-green-600">มาเรียน: {presentCount} คน</span>
              <span className="text-red-600">ขาดเรียน: {absentCount} คน</span>
              <span className="text-gray-500">วันที่: {format(selectedDate, 'dd/MM/yyyy')}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.map((student, index) => (
                <StudentAttendanceRow
                  key={student.id}
                  student={student}
                  index={index}
                  isPresent={attendanceData[student.id]}
                  hasExistingRecord={!!existingRecords[student.id]}
                  onAttendanceChange={onAttendanceChange}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={onSave}
          disabled={isLoading}
          className="w-full bg-thai-blue-600 hover:bg-thai-blue-700 text-white py-3 text-lg rounded-xl"
        >
          <Save className="w-5 h-5 mr-2" />
          {isLoading ? 'กำลังบันทึก...' : `บันทึกการเช็คชื่อ (${format(selectedDate, 'dd/MM/yyyy')})`}
        </Button>
      </>
    );
  }

  return null;
}
