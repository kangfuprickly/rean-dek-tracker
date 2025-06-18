
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { getTodayDateString } from './attendanceStats';
import { GRADE_CLASSROOMS } from '@/types';

// Function to get all possible classrooms from the GRADE_CLASSROOMS constant
const getAllPossibleClassrooms = (): string[] => {
  const allClassrooms: string[] = [];
  Object.values(GRADE_CLASSROOMS).forEach(classrooms => {
    allClassrooms.push(...classrooms);
  });
  return allClassrooms.sort((a, b) => {
    // Sort by grade then by room number
    const parseClassroom = (classroom: string) => {
      const match = classroom.match(/ม\.(\d+)\/(\d+)/);
      if (match) {
        return { grade: parseInt(match[1]), room: parseInt(match[2]) };
      }
      return { grade: 0, room: 0 };
    };
    
    const aData = parseClassroom(a);
    const bData = parseClassroom(b);
    
    if (aData.grade !== bData.grade) {
      return aData.grade - bData.grade;
    }
    return aData.room - bData.room;
  });
};

// Updated function to get classroom statistics with proper attendance calculation
export const getClassroomStats = async (date?: string) => {
  const targetDate = date || getTodayDateString();
  
  try {
    console.log(`[getClassroomStats] Fetching classroom stats for date: ${targetDate}`);
    
    // Get all possible classrooms from the type definition
    const allPossibleClassrooms = getAllPossibleClassrooms();
    console.log(`[getClassroomStats] All possible classrooms:`, allPossibleClassrooms);

    // Initialize stats for all possible classrooms
    const classroomStats: Record<string, { total: number; present: number; absent: number }> = {};
    
    allPossibleClassrooms.forEach(classroom => {
      classroomStats[classroom] = { total: 0, present: 0, absent: 0 };
    });

    // Get student count per classroom from database
    const { data: studentCounts, error: studentError } = await supabase
      .from('students')
      .select('classroom')
      .order('classroom');

    if (studentError) {
      console.error('[getClassroomStats] Error fetching student counts:', studentError);
      throw studentError;
    }

    // Count students per classroom (only for classrooms that exist in database)
    studentCounts?.forEach(student => {
      if (classroomStats[student.classroom]) {
        classroomStats[student.classroom].total++;
      }
    });

    console.log(`[getClassroomStats] Student counts per classroom:`, 
      Object.fromEntries(Object.entries(classroomStats).map(([k, v]) => [k, v.total])));

    // Get attendance records for the specified date
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records')
      .select('student_id, status')
      .eq('date', targetDate);

    if (attendanceError) {
      console.error('[getClassroomStats] Error fetching attendance records:', attendanceError);
      throw attendanceError;
    }

    console.log(`[getClassroomStats] Found ${attendanceRecords?.length || 0} attendance records for ${targetDate}`);

    // If we have attendance records, get student info for those records
    if (attendanceRecords && attendanceRecords.length > 0) {
      const studentIds = attendanceRecords.map(record => record.student_id);
      
      const { data: studentsWithAttendance, error: studentsError } = await supabase
        .from('students')
        .select('id, classroom')
        .in('id', studentIds);

      if (studentsError) {
        console.error('[getClassroomStats] Error fetching students for attendance:', studentsError);
        throw studentsError;
      }

      // Create a map of student_id to classroom
      const studentClassroomMap: Record<string, string> = {};
      studentsWithAttendance?.forEach(student => {
        studentClassroomMap[student.id] = student.classroom;
      });

      // Count present students per classroom
      attendanceRecords.forEach(record => {
        const classroom = studentClassroomMap[record.student_id];
        if (classroom && classroomStats[classroom] && record.status === 'present') {
          classroomStats[classroom].present++;
        }
      });
    }

    // Calculate absent counts for each classroom (total - present)
    Object.keys(classroomStats).forEach(classroom => {
      const stats = classroomStats[classroom];
      stats.absent = Math.max(0, stats.total - stats.present);
      
      console.log(`[getClassroomStats] ${classroom}: total=${stats.total}, present=${stats.present}, absent=${stats.absent}`);
    });

    console.log(`[getClassroomStats] Final classroom stats for ${targetDate}:`, classroomStats);
    
    return classroomStats;
  } catch (error) {
    console.error('[getClassroomStats] Error fetching classroom stats:', error);
    // Return empty stats for all classrooms if there's an error
    const allPossibleClassrooms = getAllPossibleClassrooms();
    const emptyStats: Record<string, { total: number; present: number; absent: number }> = {};
    allPossibleClassrooms.forEach(classroom => {
      emptyStats[classroom] = { total: 0, present: 0, absent: 0 };
    });
    return emptyStats;
  }
};
