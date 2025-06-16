
import { Student, AttendanceRecord } from '../types';
import { subDays, format } from 'date-fns';
import { getAllStudents, convertDatabaseStudentToAppStudent } from './studentDatabase';

// Get today's date in YYYY-MM-DD format
export const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

// Get students by classroom from database
export const getStudentsByClassroom = async (classroom: string): Promise<Student[]> => {
  try {
    const { getStudentsByClassroom: getDbStudentsByClassroom } = await import('./studentDatabase');
    const dbStudents = await getDbStudentsByClassroom(classroom);
    return dbStudents.map(convertDatabaseStudentToAppStudent);
  } catch (error) {
    console.error('Error fetching students by classroom:', error);
    return [];
  }
};

// Get all students from database
export const getAllStudentsFromDb = async (): Promise<Student[]> => {
  try {
    const dbStudents = await getAllStudents();
    return dbStudents.map(convertDatabaseStudentToAppStudent);
  } catch (error) {
    console.error('Error fetching all students:', error);
    return [];
  }
};

// Get attendance statistics
export const getAttendanceStats = async () => {
  const today = getTodayDateString();
  const students = await getAllStudentsFromDb();
  const totalStudents = students.length;
  
  let presentToday = 0;
  let absentToday = 0;
  
  students.forEach(student => {
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
export const getClassroomStats = async () => {
  const today = getTodayDateString();
  const students = await getAllStudentsFromDb();
  const classroomStats: Record<string, { total: number; present: number; absent: number }> = {};
  
  students.forEach(student => {
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
export const getAlertStudents = async () => {
  const students = await getAllStudentsFromDb();
  const alertStudents: { student: Student; consecutiveAbsentDays: number }[] = [];
  
  students.forEach(student => {
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
