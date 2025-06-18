
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

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
