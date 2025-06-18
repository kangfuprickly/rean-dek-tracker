
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

    // Get ALL attendance records for the specified date with student classroom info
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records')
      .select(`
        status,
        students!inner(classroom)
      `)
      .eq('date', targetDate);

    if (attendanceError) {
      console.error('[getClassroomStats] Error fetching attendance records:', attendanceError);
      throw attendanceError;
    }

    console.log(`[getClassroomStats] Found ${attendanceRecords?.length || 0} total attendance records for ${targetDate}`);

    // Count present and absent students per classroom
    if (attendanceRecords && attendanceRecords.length > 0) {
      attendanceRecords.forEach(record => {
        const classroom = record.students.classroom;
        if (classroom && classroomStats[classroom]) {
          if (record.status === 'present') {
            classroomStats[classroom].present++;
          }
          // Note: We don't need to count 'absent' records here because 
          // absent = total - present (some students might not have attendance records yet)
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
