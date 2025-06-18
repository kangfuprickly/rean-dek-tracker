import { Student, AttendanceRecord } from '../types';
import { subDays, format } from 'date-fns';
import { getAllStudents, convertDatabaseStudentToAppStudent } from './studentDatabase';
import { getAttendanceRecordsByDate, getAttendanceRecordsByStudentId, convertDatabaseAttendanceToAppAttendance } from './attendanceDatabase';
import { supabase } from '@/integrations/supabase/client';
import { GRADE_CLASSROOMS } from '../types';

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

// Fixed function to get attendance statistics with proper date handling
export const getAttendanceStats = async (date?: string) => {
  const targetDate = date || getTodayDateString();
  
  try {
    console.log(`[getAttendanceStats] Fetching stats for date: ${targetDate}`);
    
    // Get total student count directly from database
    const { count: totalStudents, error: countError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('[getAttendanceStats] Error counting students:', countError);
      throw countError;
    }

    console.log(`[getAttendanceStats] Total students in database: ${totalStudents}`);

    // Get attendance records for the specified date
    const { data: dateRecords, error: recordsError } = await supabase
      .from('attendance_records')
      .select('status')
      .eq('date', targetDate);

    if (recordsError) {
      console.error('[getAttendanceStats] Error fetching attendance records:', recordsError);
      throw recordsError;
    }

    console.log(`[getAttendanceStats] Found ${dateRecords?.length || 0} attendance records for ${targetDate}`);

    const presentToday = dateRecords?.filter(record => record.status === 'present').length || 0;
    const absentRecorded = dateRecords?.filter(record => record.status === 'absent').length || 0;
    const totalRecorded = dateRecords?.length || 0;
    
    // Calculate absent count: total students minus present students
    const absentToday = (totalStudents || 0) - presentToday;
    
    console.log(`[getAttendanceStats] Stats for ${targetDate}:`, {
      totalStudents: totalStudents || 0,
      presentToday,
      absentToday,
      totalRecorded,
      absentRecorded
    });
    
    return {
      totalStudents: totalStudents || 0,
      presentToday,
      absentToday,
    };
  } catch (error) {
    console.error('[getAttendanceStats] Error fetching attendance stats:', error);
    return {
      totalStudents: 0,
      presentToday: 0,
      absentToday: 0,
    };
  }
};

// Fixed function to get classroom statistics with better date handling
export const getClassroomStats = async (date?: string) => {
  const targetDate = date || getTodayDateString();
  
  try {
    console.log(`[getClassroomStats] Fetching classroom stats for date: ${targetDate}`);
    
    // Get all students grouped by classroom
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, classroom');

    if (studentsError) {
      console.error('[getClassroomStats] Error fetching students:', studentsError);
      throw studentsError;
    }

    console.log(`[getClassroomStats] Found ${students?.length || 0} total students`);

    // Get attendance records for the specified date
    const { data: dateRecords, error: recordsError } = await supabase
      .from('attendance_records')
      .select('student_id, status')
      .eq('date', targetDate);

    if (recordsError) {
      console.error('[getClassroomStats] Error fetching attendance records:', recordsError);
      throw recordsError;
    }

    console.log(`[getClassroomStats] Found ${dateRecords?.length || 0} attendance records for ${targetDate}`);

    // Initialize classroom stats object
    const classroomStats: Record<string, { total: number; present: number; absent: number }> = {};
    
    // Count students by classroom and initialize stats
    students?.forEach(student => {
      if (!classroomStats[student.classroom]) {
        classroomStats[student.classroom] = { total: 0, present: 0, absent: 0 };
      }
      classroomStats[student.classroom].total++;
    });

    console.log(`[getClassroomStats] Initialized stats for ${Object.keys(classroomStats).length} classrooms`);

    // Count attendance by classroom based on actual records
    dateRecords?.forEach(record => {
      const student = students?.find(s => s.id === record.student_id);
      if (student && classroomStats[student.classroom]) {
        if (record.status === 'present') {
          classroomStats[student.classroom].present++;
        }
        // Don't count absent records here - we'll calculate it below
      }
    });

    // Calculate absent counts correctly for each classroom
    Object.keys(classroomStats).forEach(classroom => {
      const stats = classroomStats[classroom];
      // Absent = Total students - Present students (regardless of recorded absent records)
      stats.absent = stats.total - stats.present;
      
      console.log(`[getClassroomStats] ${classroom}: ${stats.present}/${stats.total} present, ${stats.absent} absent`);
    });

    // Add any classrooms from GRADE_CLASSROOMS that don't have students yet but should be shown
    Object.values(GRADE_CLASSROOMS).flat().forEach(classroom => {
      if (!classroomStats[classroom]) {
        classroomStats[classroom] = { total: 0, present: 0, absent: 0 };
      }
    });
    
    console.log(`[getClassroomStats] Final classroom stats calculated for ${Object.keys(classroomStats).length} classrooms on ${targetDate}`);
    
    return classroomStats;
  } catch (error) {
    console.error('[getClassroomStats] Error fetching classroom stats:', error);
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

// New function for real attendance data export - only absent students
export const getAttendanceDataForExport = async (startDate: string, endDate: string) => {
  try {
    console.log(`Fetching absent students data from ${startDate} to ${endDate}`);
    
    // Get all attendance records in the date range where status is 'absent'
    const { data: absentRecords } = await supabase
      .from('attendance_records')
      .select(`
        date,
        status,
        reason,
        student_id,
        students!inner(
          student_number,
          first_name,
          last_name,
          classroom
        )
      `)
      .eq('status', 'absent')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('students(classroom)', { ascending: true });

    if (!absentRecords || absentRecords.length === 0) {
      console.log('No absent students found in the specified date range');
      return [];
    }

    // Transform the data for export
    const exportData = absentRecords.map(record => ({
      date: record.date,
      classroom: record.students.classroom,
      studentNumber: record.students.student_number,
      studentName: `${record.students.first_name} ${record.students.last_name}`,
      reason: record.reason || ''
    }));

    console.log(`Found ${exportData.length} absent student records for export`);
    return exportData;
    
  } catch (error) {
    console.error('Error fetching attendance data for export:', error);
    return [];
  }
};
