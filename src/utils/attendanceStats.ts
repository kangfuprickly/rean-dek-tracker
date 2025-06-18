
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

// Get today's date in YYYY-MM-DD format
export const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

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
