
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { getTodayDateString } from './attendanceStats';

// Completely rewritten function to get classroom statistics with all classrooms
export const getClassroomStats = async (date?: string) => {
  const targetDate = date || getTodayDateString();
  
  try {
    console.log(`[getClassroomStats] Fetching classroom stats for date: ${targetDate}`);
    
    // Initialize classroom stats - get all actual classrooms from database first
    const { data: allClassrooms, error: classroomError } = await supabase
      .from('students')
      .select('classroom')
      .order('classroom');

    if (classroomError) {
      console.error('[getClassroomStats] Error fetching classrooms:', classroomError);
      throw classroomError;
    }

    // Get unique classrooms that actually exist in database
    const existingClassrooms = [...new Set(allClassrooms?.map(s => s.classroom) || [])];
    console.log(`[getClassroomStats] Found existing classrooms:`, existingClassrooms);

    // Initialize stats for all existing classrooms
    const classroomStats: Record<string, { total: number; present: number; absent: number }> = {};
    
    existingClassrooms.forEach(classroom => {
      classroomStats[classroom] = { total: 0, present: 0, absent: 0 };
    });

    // Get student count per classroom
    const { data: studentCounts, error: studentError } = await supabase
      .from('students')
      .select('classroom')
      .order('classroom');

    if (studentError) {
      console.error('[getClassroomStats] Error fetching student counts:', studentError);
      throw studentError;
    }

    // Count students per classroom
    studentCounts?.forEach(student => {
      if (classroomStats[student.classroom]) {
        classroomStats[student.classroom].total++;
      }
    });

    console.log(`[getClassroomStats] Student counts per classroom:`, 
      Object.fromEntries(Object.entries(classroomStats).map(([k, v]) => [k, v.total])));

    // Get attendance records for the specified date with student classroom info
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records')
      .select(`
        status,
        students!inner(classroom)
      `)
      .eq('date', targetDate)
      .eq('status', 'present');

    if (attendanceError) {
      console.error('[getClassroomStats] Error fetching attendance records:', attendanceError);
      throw attendanceError;
    }

    console.log(`[getClassroomStats] Found ${attendanceRecords?.length || 0} present attendance records for ${targetDate}`);

    // Count present students per classroom
    if (attendanceRecords && attendanceRecords.length > 0) {
      attendanceRecords.forEach(record => {
        const classroom = record.students.classroom;
        if (classroom && classroomStats[classroom]) {
          classroomStats[classroom].present++;
        }
      });
    }

    // Calculate absent counts for each classroom
    Object.keys(classroomStats).forEach(classroom => {
      const stats = classroomStats[classroom];
      stats.absent = Math.max(0, stats.total - stats.present);
      
      console.log(`[getClassroomStats] ${classroom}: total=${stats.total}, present=${stats.present}, absent=${stats.absent}`);
    });

    console.log(`[getClassroomStats] Final classroom stats for ${targetDate}:`, classroomStats);
    
    return classroomStats;
  } catch (error) {
    console.error('[getClassroomStats] Error fetching classroom stats:', error);
    return {};
  }
};
