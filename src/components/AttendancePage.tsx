
import { useState } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getStudentsByClassroom } from '@/utils/mockData';
import { upsertAttendanceRecord, getAttendanceRecordsByDate } from '@/utils/attendanceDatabase';
import { Grade, Student } from '@/types';
import DateSelector from './attendance/DateSelector';
import ClassroomSelector from './attendance/ClassroomSelector';
import StudentList from './attendance/StudentList';

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedGrade, setSelectedGrade] = useState<Grade | ''>('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
  const [existingRecords, setExistingRecords] = useState<Record<string, string>>({});
  const [isLoading, setSaveLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const { toast } = useToast();

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      console.log(`[AttendancePage] Date changed to: ${format(date, 'yyyy-MM-dd')}`);
      setSelectedDate(date);
      // Reset classroom data when date changes
      setAttendanceData({});
      setExistingRecords({});
      // Reload students if classroom is already selected
      if (selectedClassroom) {
        handleClassroomChange(selectedClassroom);
      }
    }
  };

  const handleGradeChange = (grade: Grade) => {
    console.log(`[AttendancePage] Grade changed to: ${grade}`);
    setSelectedGrade(grade);
    setSelectedClassroom('');
    setStudents([]);
    setAttendanceData({});
    setExistingRecords({});
  };

  const handleClassroomChange = async (classroom: string) => {
    console.log(`[AttendancePage] Classroom changed to: ${classroom}`);
    setSelectedClassroom(classroom);
    setIsLoadingStudents(true);
    
    try {
      const classroomStudents = await getStudentsByClassroom(classroom);
      console.log(`[AttendancePage] Loaded ${classroomStudents.length} students for ${classroom}`);
      setStudents(classroomStudents);
      
      // Check existing attendance records for selected date
      const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
      console.log(`[AttendancePage] Checking attendance records for ${selectedDateString}`);
      const dayRecords = await getAttendanceRecordsByDate(selectedDateString);
      
      // Initialize attendance data and track existing records
      const initialAttendance: Record<string, boolean> = {};
      const recordIds: Record<string, string> = {};
      
      classroomStudents.forEach(student => {
        const existingRecord = dayRecords.find(record => record.student_id === student.id);
        if (existingRecord) {
          initialAttendance[student.id] = existingRecord.status === 'present';
          recordIds[student.id] = existingRecord.id;
          console.log(`[AttendancePage] Found existing record for ${student.firstName} ${student.lastName}: ${existingRecord.status}`);
        } else {
          initialAttendance[student.id] = true; // Default to present
          console.log(`[AttendancePage] No existing record for ${student.firstName} ${student.lastName}, defaulting to present`);
        }
      });
      
      setAttendanceData(initialAttendance);
      setExistingRecords(recordIds);
    } catch (error) {
      console.error('[AttendancePage] Error loading students:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายชื่อนักเรียนได้",
        duration: 3000,
      });
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    console.log(`[AttendancePage] Attendance changed for student ${studentId}: ${isPresent ? 'present' : 'absent'}`);
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: isPresent
    }));
  };

  const handleSave = async () => {
    if (students.length === 0) {
      console.log('[AttendancePage] No students to save attendance for');
      return;
    }
    
    setSaveLoading(true);
    
    try {
      const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
      console.log(`[AttendancePage] Saving attendance for ${students.length} students on ${selectedDateString}`);
      
      // Save attendance records to database using upsert
      for (const student of students) {
        const isPresent = attendanceData[student.id];
        const status = isPresent ? 'present' : 'absent';
        
        console.log(`[AttendancePage] Saving ${student.firstName} ${student.lastName} as ${status} for ${selectedDateString}`);
        
        await upsertAttendanceRecord({
          student_id: student.id,
          date: selectedDateString,
          status
        });
      }
      
      const presentCount = Object.values(attendanceData).filter(Boolean).length;
      const absentCount = students.length - presentCount;
      
      console.log(`[AttendancePage] Successfully saved attendance: ${presentCount} present, ${absentCount} absent`);
      
      toast({
        title: "บันทึกสำเร็จ! ✅",
        description: `บันทึกการเช็คชื่อ ${selectedClassroom} วันที่ ${format(selectedDate, 'dd/MM/yyyy')} เรียบร้อยแล้ว\nมาเรียน: ${presentCount} คน, ขาดเรียน: ${absentCount} คน`,
        duration: 3000,
      });
      
      // Refresh the data to get updated records
      await handleClassroomChange(selectedClassroom);
      
    } catch (error) {
      console.error('[AttendancePage] Error saving attendance:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลการเข้าเรียนได้",
        duration: 3000,
      });
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="p-4 pb-20 thai-content animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">เช็คการมาเรียนของนักเรียน</h1>
        <p className="text-gray-600">เลือกวันที่และห้องเรียนที่ต้องการเช็คชื่อ</p>
      </div>

      <DateSelector 
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      <ClassroomSelector 
        selectedGrade={selectedGrade}
        selectedClassroom={selectedClassroom}
        onGradeChange={handleGradeChange}
        onClassroomChange={handleClassroomChange}
      />

      <StudentList 
        students={students}
        selectedClassroom={selectedClassroom}
        selectedDate={selectedDate}
        attendanceData={attendanceData}
        existingRecords={existingRecords}
        isLoading={isLoading}
        isLoadingStudents={isLoadingStudents}
        onAttendanceChange={handleAttendanceChange}
        onSave={handleSave}
      />
    </div>
  );
}
