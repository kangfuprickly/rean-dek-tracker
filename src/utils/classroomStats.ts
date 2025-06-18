
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

    // Get ALL students from database without any limits
    console.log(`[getClassroomStats] Fetching all students from database...`);
    const { data: allStudents, error: studentError } = await supabase
      .from('students')
      .select('id, classroom');

    if (studentError) {
      console.error('[getClassroomStats] Error fetching students:', studentError);
      throw studentError;
    }

    console.log(`[getClassroomStats] Successfully fetched ${allStudents?.length || 0} students from database`);

    // Count students per classroom and create student-to-classroom mapping
    const studentClassroomMap: Record<string, string> = {};
    if (allStudents && allStudents.length > 0) {
      allStudents.forEach(student => {
        if (student.classroom) {
          // Initialize classroom if not exists in our stats
          if (!classroomStats[student.classroom]) {
            classroomStats[student.classroom] = { total: 0, present: 0, absent: 0 };
          }
          
          classroomStats[student.classroom].total++;
          studentClassroomMap[student.id] = student.classroom;
        }
      });
    }

    console.log(`[getClassroomStats] Student counts per classroom:`, 
      Object.fromEntries(Object.entries(classroomStats).map(([k, v]) => [k, v.total])));

    // Get ALL attendance records for the specified date without any limits
    console.log(`[getClassroomStats] Fetching attendance records for ${targetDate}...`);
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records')
      .select('student_id, status')
      .eq('date', targetDate);

    if (attendanceError) {
      console.error('[getClassroomStats] Error fetching attendance records:', attendanceError);
      throw attendanceError;
    }

    console.log(`[getClassroomStats] Successfully fetched ${attendanceRecords?.length || 0} attendance records for ${targetDate}`);

    // Count present students per classroom using the mapping
    if (attendanceRecords && attendanceRecords.length > 0) {
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
