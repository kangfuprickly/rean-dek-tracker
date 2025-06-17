import { Student, AttendanceRecord } from '../types';
import { subDays, format } from 'date-fns';
import { getAllStudents, convertDatabaseStudentToAppStudent } from './studentDatabase';
import { getAttendanceRecordsByDate, getAttendanceRecordsByStudentId, convertDatabaseAttendanceToAppAttendance } from './attendanceDatabase';
import { supabase } from '@/integrations/supabase/client';

// Get today's date in YYYY-MM-DD format
export const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

// Get students by classroom from database with their attendance records
export const getStudentsByClassroom = async (classroom: string): Promise<Student[]> => {
  try {
    const { getStudentsByClassroom: getDbStudentsByClassroom } = await import('./studentDatabase');
    const dbStudents = await getDbStudentsByClassroom(classroom);
    
    console.log(`Fetched ${dbStudents.length} students for classroom ${classroom}`);
    
    // Get attendance records for each student in batches to avoid overwhelming the database
    const batchSize = 50;
    const studentsWithAttendance: Student[] = [];
    
    for (let i = 0; i < dbStudents.length; i += batchSize) {
      const batch = dbStudents.slice(i, i + batchSize);
      const batchPromises = batch.map(async (dbStudent) => {
        const attendanceRecords = await getAttendanceRecordsByStudentId(dbStudent.id);
        const appStudent = convertDatabaseStudentToAppStudent(dbStudent);
        appStudent.attendanceRecords = attendanceRecords.map(convertDatabaseAttendanceToAppAttendance);
        return appStudent;
      });
      
      const batchResults = await Promise.all(batchPromises);
      studentsWithAttendance.push(...batchResults);
    }
    
    return studentsWithAttendance;
  } catch (error) {
    console.error('Error fetching students by classroom:', error);
    return [];
  }
};

// Optimized function to get attendance statistics without loading all student data
export const getAttendanceStats = async () => {
  const today = getTodayDateString();
  
  try {
    // Get total student count directly from database
    const { count: totalStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    // Get today's attendance records directly
    const { data: todayRecords } = await supabase
      .from('attendance_records')
      .select('status')
      .eq('date', today);

    const presentToday = todayRecords?.filter(record => record.status === 'present').length || 0;
    const recordedToday = todayRecords?.length || 0;
    const absentToday = (totalStudents || 0) - presentToday;
    
    console.log(`Fast attendance stats: ${totalStudents} total, ${presentToday} present, ${absentToday} absent`);
    
    return {
      totalStudents: totalStudents || 0,
      presentToday,
      absentToday,
    };
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return {
      totalStudents: 0,
      presentToday: 0,
      absentToday: 0,
    };
  }
};

// Optimized function to get classroom statistics
export const getClassroomStats = async () => {
  const today = getTodayDateString();
  
  try {
    // Get all students grouped by classroom
    const { data: students } = await supabase
      .from('students')
      .select('id, classroom');

    // Get today's attendance records
    const { data: todayRecords } = await supabase
      .from('attendance_records')
      .select('student_id, status')
      .eq('date', today);

    const classroomStats: Record<string, { total: number; present: number; absent: number }> = {};
    
    // Initialize classroom stats
    students?.forEach(student => {
      if (!classroomStats[student.classroom]) {
        classroomStats[student.classroom] = { total: 0, present: 0, absent: 0 };
      }
      classroomStats[student.classroom].total++;
    });

    // Count attendance by classroom
    todayRecords?.forEach(record => {
      const student = students?.find(s => s.id === record.student_id);
      if (student && classroomStats[student.classroom]) {
        if (record.status === 'present') {
          classroomStats[student.classroom].present++;
        }
      }
    });

    // Calculate absent counts
    Object.keys(classroomStats).forEach(classroom => {
      classroomStats[classroom].absent = 
        classroomStats[classroom].total - classroomStats[classroom].present;
    });
    
    console.log(`Fast classroom stats calculated for ${Object.keys(classroomStats).length} classrooms`);
    
    return classroomStats;
  } catch (error) {
    console.error('Error fetching classroom stats:', error);
    return {};
  }
};

// Optimized function to get alert students (only load students with consecutive absences)
export const getAlertStudents = async () => {
  try {
    // Get recent attendance records (last 7 days) grouped by student
    const last7Days = Array.from({ length: 7 }, (_, i) => 
      format(subDays(new Date(), i), 'yyyy-MM-dd')
    );

    const { data: recentRecords } = await supabase
      .from('attendance_records')
      .select('student_id, date, status')
      .in('date', last7Days)
      .order('date', { ascending: false });

    // Group records by student
    const studentRecords: Record<string, any[]> = {};
    recentRecords?.forEach(record => {
      if (!studentRecords[record.student_id]) {
        studentRecords[record.student_id] = [];
      }
      studentRecords[record.student_id].push(record);
    });

    // Find students with 4+ consecutive absences
    const alertStudentIds: { studentId: string; consecutiveAbsent: number }[] = [];
    
    Object.entries(studentRecords).forEach(([studentId, records]) => {
      const sortedRecords = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let consecutiveAbsent = 0;
      for (const record of sortedRecords) {
        if (record.status === 'absent') {
          consecutiveAbsent++;
        } else {
          break;
        }
      }
      
      if (consecutiveAbsent >= 4) {
        alertStudentIds.push({ studentId, consecutiveAbsent });
      }
    });

    // Only load student details for those with alerts
    if (alertStudentIds.length === 0) {
      return [];
    }

    const { data: alertStudentData } = await supabase
      .from('students')
      .select('*')
      .in('id', alertStudentIds.map(a => a.studentId));

    const alertStudents = alertStudentIds.map(alert => {
      const studentData = alertStudentData?.find(s => s.id === alert.studentId);
      if (studentData) {
        return {
          student: convertDatabaseStudentToAppStudent(studentData),
          consecutiveAbsentDays: alert.consecutiveAbsent
        };
      }
      return null;
    }).filter(Boolean);

    console.log(`Fast alert calculation found ${alertStudents.length} students with alerts`);
    
    return alertStudents;
  } catch (error) {
    console.error('Error fetching alert students:', error);
    return [];
  }
};

// Keep the original function for cases where full student data is needed
export const getAllStudentsFromDb = async (): Promise<Student[]> => {
  try {
    const dbStudents = await getAllStudents();
    console.log(`Fetched ${dbStudents.length} total students from database`);
    
    // Get attendance records for each student in batches to improve performance
    const batchSize = 50;
    const studentsWithAttendance: Student[] = [];
    
    for (let i = 0; i < dbStudents.length; i += batchSize) {
      const batch = dbStudents.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(dbStudents.length / batchSize)}`);
      
      const batchPromises = batch.map(async (dbStudent) => {
        const attendanceRecords = await getAttendanceRecordsByStudentId(dbStudent.id);
        const appStudent = convertDatabaseStudentToAppStudent(dbStudent);
        appStudent.attendanceRecords = attendanceRecords.map(convertDatabaseAttendanceToAppAttendance);
        return appStudent;
      });
      
      const batchResults = await Promise.all(batchPromises);
      studentsWithAttendance.push(...batchResults);
    }
    
    console.log(`Final processed students count: ${studentsWithAttendance.length}`);
    return studentsWithAttendance;
  } catch (error) {
    console.error('Error fetching all students:', error);
    return [];
  }
};
