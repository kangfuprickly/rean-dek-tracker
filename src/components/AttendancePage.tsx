import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { getStudentsByClassroom } from '@/utils/mockData';
import { insertAttendanceRecord, updateAttendanceRecord, getAttendanceRecordsByDate } from '@/utils/attendanceDatabase';
import { GRADE_CLASSROOMS, Grade, Student } from '@/types';
import { CheckSquare, Users, Save, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    setSelectedGrade(grade);
    setSelectedClassroom('');
    setStudents([]);
    setAttendanceData({});
    setExistingRecords({});
  };

  const handleClassroomChange = async (classroom: string) => {
    setSelectedClassroom(classroom);
    setIsLoadingStudents(true);
    
    try {
      const classroomStudents = await getStudentsByClassroom(classroom);
      setStudents(classroomStudents);
      
      // Check existing attendance records for selected date
      const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
      const dayRecords = await getAttendanceRecordsByDate(selectedDateString);
      
      // Initialize attendance data and track existing records
      const initialAttendance: Record<string, boolean> = {};
      const recordIds: Record<string, string> = {};
      
      classroomStudents.forEach(student => {
        const existingRecord = dayRecords.find(record => record.student_id === student.id);
        if (existingRecord) {
          initialAttendance[student.id] = existingRecord.status === 'present';
          recordIds[student.id] = existingRecord.id;
        } else {
          initialAttendance[student.id] = true; // Default to present
        }
      });
      
      setAttendanceData(initialAttendance);
      setExistingRecords(recordIds);
    } catch (error) {
      console.error('Error loading students:', error);
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
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: isPresent
    }));
  };

  const handleSave = async () => {
    if (students.length === 0) return;
    
    setSaveLoading(true);
    
    try {
      const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
      
      // Save attendance records to database
      for (const student of students) {
        const isPresent = attendanceData[student.id];
        const status = isPresent ? 'present' : 'absent';
        const existingRecordId = existingRecords[student.id];
        
        if (existingRecordId) {
          // Update existing record
          await updateAttendanceRecord(existingRecordId, { status });
        } else {
          // Create new record
          await insertAttendanceRecord({
            student_id: student.id,
            date: selectedDateString,
            status
          });
        }
      }
      
      const presentCount = Object.values(attendanceData).filter(Boolean).length;
      const absentCount = students.length - presentCount;
      
      toast({
        title: "บันทึกสำเร็จ! ✅",
        description: `บันทึกการเช็คชื่อ ${selectedClassroom} วันที่ ${format(selectedDate, 'dd/MM/yyyy')} เรียบร้อยแล้ว\nมาเรียน: ${presentCount} คน, ขาดเรียน: ${absentCount} คน`,
        duration: 3000,
      });
      
      // Refresh the data to get updated records
      await handleClassroomChange(selectedClassroom);
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลการเข้าเรียนได้",
        duration: 3000,
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const presentCount = Object.values(attendanceData).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="p-4 pb-20 thai-content animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">เช็คการมาเรียนของนักเรียน</h1>
        <p className="text-gray-600">เลือกวันที่และห้องเรียนที่ต้องการเช็คชื่อ</p>
      </div>

      {/* Date Selection */}
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-thai-blue-600" />
            เลือกวันที่
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : <span>เลือกวันที่</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                initialFocus
                className="pointer-events-auto"
                disabled={(date) => date > new Date()} // Disable future dates
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Grade and Classroom Selection */}
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
            <Select value={selectedGrade} onValueChange={handleGradeChange}>
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
              <Select value={selectedClassroom} onValueChange={handleClassroomChange}>
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

      {/* Loading indicator for students */}
      {isLoadingStudents && (
        <div className="text-center py-12">
          <div className="text-thai-blue-600 mb-4">
            <svg className="w-8 h-8 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-600">กำลังโหลดรายชื่อนักเรียน...</p>
        </div>
      )}

      {/* Student List */}
      {students.length > 0 && !isLoadingStudents && (
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
                  <div key={student.id} className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm text-gray-500 font-mono w-8">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-lg">
                            {student.firstName} {student.lastName}
                          </p>
                          {existingRecords[student.id] && (
                            <p className="text-xs text-blue-600 mt-1">
                              ✓ มีข้อมูลการเข้าเรียนแล้ว
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <RadioGroup
                        value={attendanceData[student.id] ? "present" : "absent"}
                        onValueChange={(value) => handleAttendanceChange(student.id, value === "present")}
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
                ))}
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-thai-blue-600 hover:bg-thai-blue-700 text-white py-3 text-lg rounded-xl"
          >
            <Save className="w-5 h-5 mr-2" />
            {isLoading ? 'กำลังบันทึก...' : `บันทึกการเช็คชื่อ (${format(selectedDate, 'dd/MM/yyyy')})`}
          </Button>
        </>
      )}

      {/* Empty state when no students in classroom */}
      {selectedClassroom && students.length === 0 && !isLoadingStudents && (
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
      )}
    </div>
  );
}
