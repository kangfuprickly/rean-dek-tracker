
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
    console.log(`[getClassroomStats] All possible classrooms (${allPossibleClassrooms.length}):`, allPossibleClassrooms);

    // Initialize stats for all possible classrooms - ALWAYS return all classrooms
    const classroomStats: Record<string, { total: number; present: number; absent: number }> = {};
    
    allPossibleClassrooms.forEach(classroom => {
      classroomStats[classroom] = { total: 0, present: 0, absent: 0 };
    });

    // Get ALL students from database in batches to handle large datasets
    console.log(`[getClassroomStats] Fetching all students from database...`);
    let allStudents: any[] = [];
    let from = 0;
    const batchSize = 1000;
    
    while (true) {
      const { data: batchData, error: studentError } = await supabase
        .from('students')
        .select('id, classroom')
        .range(from, from + batchSize - 1);

      if (studentError) {
        console.error('[getClassroomStats] Error fetching students:', studentError);
        throw studentError;
      }

      if (!batchData || batchData.length === 0) {
        break;
      }

      allStudents = [...allStudents, ...batchData];
      
      // If we got less than the batch size, we've reached the end
      if (batchData.length < batchSize) {
        break;
      }
      
      from += batchSize;
    }

    console.log(`[getClassroomStats] Successfully fetched ${allStudents.length} students from database`);

    // Count students per classroom and create student-to-classroom mapping
    const studentClassroomMap: Record<string, string> = {};
    if (allStudents && allStudents.length > 0) {
      allStudents.forEach(student => {
        if (student.classroom) {
          // Ensure classroom exists in our stats (should already be there)
          if (!classroomStats[student.classroom]) {
            console.warn(`[getClassroomStats] Found student in unexpected classroom: ${student.classroom}`);
            classroomStats[student.classroom] = { total: 0, present: 0, absent: 0 };
          }
          
          classroomStats[student.classroom].total++;
          studentClassroomMap[student.id] = student.classroom;
        }
      });
    }

    console.log(`[getClassroomStats] Student counts per classroom:`, 
      Object.fromEntries(
        Object.entries(classroomStats)
          .filter(([_, stats]) => stats.total > 0)
          .map(([k, v]) => [k, v.total])
      )
    );

    // Get ALL attendance records for the specified date in batches
    console.log(`[getClassroomStats] Fetching attendance records for ${targetDate}...`);
    let allAttendanceRecords: any[] = [];
    from = 0;
    
    while (true) {
      const { data: batchData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('student_id, status')
        .eq('date', targetDate)
        .range(from, from + batchSize - 1);

      if (attendanceError) {
        console.error('[getClassroomStats] Error fetching attendance records:', attendanceError);
        throw attendanceError;
      }

      if (!batchData || batchData.length === 0) {
        break;
      }

      allAttendanceRecords = [...allAttendanceRecords, ...batchData];
      
      // If we got less than the batch size, we've reached the end
      if (batchData.length < batchSize) {
        break;
      }
      
      from += batchSize;
    }

    console.log(`[getClassroomStats] Successfully fetched ${allAttendanceRecords.length} attendance records for ${targetDate}`);

    // Count present students per classroom using the mapping
    if (allAttendanceRecords && allAttendanceRecords.length > 0) {
      allAttendanceRecords.forEach(record => {
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
      
      if (stats.total > 0) {
        console.log(`[getClassroomStats] ${classroom}: total=${stats.total}, present=${stats.present}, absent=${stats.absent}`);
      }
    });

    console.log(`[getClassroomStats] Final classroom stats for ${targetDate}: ${Object.keys(classroomStats).length} classrooms total`);
    
    // Return ALL classrooms, including those with 0 students
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
