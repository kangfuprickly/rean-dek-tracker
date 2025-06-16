
import { Student, AttendanceRecord } from '../types';
import { subDays, format } from 'date-fns';

// Generate mock students data
const generateMockStudents = (): Student[] => {
  const students: Student[] = [];
  const grades = ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];
  const classroomCounts = [12, 12, 9, 7, 8, 7];
  
  let studentCounter = 1;
  
  grades.forEach((grade, gradeIndex) => {
    const classroomCount = classroomCounts[gradeIndex];
    
    for (let classroom = 1; classroom <= classroomCount; classroom++) {
      // Generate 25-35 students per classroom
      const studentsInClass = Math.floor(Math.random() * 11) + 25;
      
      for (let student = 1; student <= studentsInClass; student++) {
        const studentId = `student_${studentCounter}`;
        const studentNumber = `${String(studentCounter).padStart(5, '0')}`;
        
        // Thai first names and last names
        const firstNames = [
          'สมชาย', 'สมหญิง', 'วิชัย', 'อนันต์', 'ประยุทธ์', 'สุภาพ', 'กิตติ', 'ชัยวัฒน์',
          'ปิยะ', 'นันทา', 'สุดา', 'มาลี', 'จันทร์', 'ดาว', 'รัตนา', 'สุนีย์',
          'อภิชาติ', 'ธนพล', 'วันเพ็ญ', 'สุรีย์', 'นิรันดร์', 'ชลิตา', 'พิมพ์ใจ', 'บุษกร'
        ];
        
        const lastNames = [
          'ใจดี', 'สุขใส', 'รุ่งเรือง', 'เจริญ', 'มั่นคง', 'ใสใจ', 'ยิ้มแย้ม', 'สดใส',
          'เปี่ยมสุข', 'รื่นรมย์', 'ใจงาม', 'สง่างาม', 'นุ่มนวล', 'อ่อนหวาน', 'งามสง่า', 'อบอุ่น',
          'มีสุข', 'สวยงาม', 'น่ารัก', 'สดชื่น', 'หวานใจ', 'มีชัย', 'เจริญผล', 'รมย์ใจ'
        ];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        // Generate attendance records for the past 7 days
        const attendanceRecords: AttendanceRecord[] = [];
        for (let day = 6; day >= 0; day--) {
          const date = format(subDays(new Date(), day), 'yyyy-MM-dd');
          const isAbsent = Math.random() < 0.05; // 5% chance of being absent
          
          attendanceRecords.push({
            id: `attendance_${studentId}_${date}`,
            studentId,
            date,
            status: isAbsent ? 'absent' : 'present',
            createdAt: new Date().toISOString(),
          });
        }
        
        students.push({
          id: studentId,
          studentNumber,
          firstName,
          lastName,
          grade,
          classroom: `${grade}/${classroom}`,
          attendanceRecords,
        });
        
        studentCounter++;
      }
    }
  });
  
  return students;
};

export const mockStudents = generateMockStudents();

// Get today's date in YYYY-MM-DD format
export const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

// Get students by classroom
export const getStudentsByClassroom = (classroom: string): Student[] => {
  return mockStudents.filter(student => student.classroom === classroom);
};

// Get attendance statistics
export const getAttendanceStats = () => {
  const today = getTodayDateString();
  const totalStudents = mockStudents.length;
  
  let presentToday = 0;
  let absentToday = 0;
  
  mockStudents.forEach(student => {
    const todayRecord = student.attendanceRecords.find(record => record.date === today);
    if (todayRecord?.status === 'present') {
      presentToday++;
    } else {
      absentToday++;
    }
  });
  
  return {
    totalStudents,
    presentToday,
    absentToday,
  };
};

// Get classroom statistics
export const getClassroomStats = () => {
  const today = getTodayDateString();
  const classroomStats: Record<string, { total: number; present: number; absent: number }> = {};
  
  mockStudents.forEach(student => {
    const classroom = student.classroom;
    if (!classroomStats[classroom]) {
      classroomStats[classroom] = { total: 0, present: 0, absent: 0 };
    }
    
    classroomStats[classroom].total++;
    
    const todayRecord = student.attendanceRecords.find(record => record.date === today);
    if (todayRecord?.status === 'present') {
      classroomStats[classroom].present++;
    } else {
      classroomStats[classroom].absent++;
    }
  });
  
  return classroomStats;
};

// Get students with consecutive absences (4+ days)
export const getAlertStudents = () => {
  const alertStudents: { student: Student; consecutiveAbsentDays: number }[] = [];
  
  mockStudents.forEach(student => {
    // Check last 7 days for consecutive absences
    const recentRecords = student.attendanceRecords
      .slice(-7)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let consecutiveAbsent = 0;
    for (const record of recentRecords) {
      if (record.status === 'absent') {
        consecutiveAbsent++;
      } else {
        break;
      }
    }
    
    if (consecutiveAbsent >= 4) {
      alertStudents.push({
        student,
        consecutiveAbsentDays: consecutiveAbsent,
      });
    }
  });
  
  return alertStudents;
};
