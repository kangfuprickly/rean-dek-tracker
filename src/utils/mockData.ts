
import { Student, AttendanceRecord } from '../types';
import { subDays, format } from 'date-fns';

// Empty students data - no mock data
export const mockStudents: Student[] = [];

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
