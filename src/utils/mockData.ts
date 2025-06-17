
import { Student, AttendanceRecord } from '../types';
import { subDays, format } from 'date-fns';
import { getAllStudents, convertDatabaseStudentToAppStudent } from './studentDatabase';
import { getAttendanceRecordsByDate, getAttendanceRecordsByStudentId, convertDatabaseAttendanceToAppAttendance } from './attendanceDatabase';

// Get today's date in YYYY-MM-DD format
export const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

// Get students by classroom from database with their attendance records
export const getStudentsByClassroom = async (classroom: string): Promise<Student[]> => {
  try {
    const { getStudentsByClassroom: getDbStudentsByClassroom } = await import('./studentDatabase');
    const dbStudents = await getDbStudentsByClassroom(classroom);
    
    // Get attendance records for each student
    const studentsWithAttendance = await Promise.all(
      dbStudents.map(async (dbStudent) => {
        const attendanceRecords = await getAttendanceRecordsByStudentId(dbStudent.id);
        const appStudent = convertDatabaseStudentToAppStudent(dbStudent);
        appStudent.attendanceRecords = attendanceRecords.map(convertDatabaseAttendanceToAppAttendance);
        return appStudent;
      })
    );
    
    return studentsWithAttendance;
  } catch (error) {
    console.error('Error fetching students by classroom:', error);
    return [];
  }
};

// Get all students from database with their attendance records
export const getAllStudentsFromDb = async (): Promise<Student[]> => {
  try {
    const dbStudents = await getAllStudents();
    
    // Get attendance records for each student
    const studentsWithAttendance = await Promise.all(
      dbStudents.map(async (dbStudent) => {
        const attendanceRecords = await getAttendanceRecordsByStudentId(dbStudent.id);
        const appStudent = convertDatabaseStudentToAppStudent(dbStudent);
        appStudent.attendanceRecords = attendanceRecords.map(convertDatabaseAttendanceToAppAttendance);
        return appStudent;
      })
    );
    
    return studentsWithAttendance;
  } catch (error) {
    console.error('Error fetching all students:', error);
    return [];
  }
};

// Get attendance statistics from real database
export const getAttendanceStats = async () => {
  const today = getTodayDateString();
  const students = await getAllStudentsFromDb();
  const totalStudents = students.length;
  
  let presentToday = 0;
  let absentToday = 0;
  
  students.forEach(student => {
    const todayRecord = student.attendanceRecords.find(record => record.date === today);
    if (todayRecord) {
      if (todayRecord.status === 'present') {
        presentToday++;
      } else {
        absentToday++;
      }
    } else {
      // If no record exists for today, assume absent
      absentToday++;
    }
  });
  
  return {
    totalStudents,
    presentToday,
    absentToday,
  };
};

// Get classroom statistics from real database
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
    if (todayRecord && todayRecord.status === 'present') {
      classroomStats[classroom].present++;
    } else {
      classroomStats[classroom].absent++;
    }
  });
  
  return classroomStats;
};

// Get students with consecutive absences (4+ days) from real database
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
