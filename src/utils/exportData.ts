
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

// Function for Ministry of Education format attendance report
export const getAttendanceReportData = async (classroom: string, month: string, year: string) => {
  try {
    console.log(`Fetching attendance report data for classroom: ${classroom}, month: ${month}, year: ${year}`);
    
    // Convert Buddhist year to Christian year for database queries
    const christianYear = parseInt(year) - 543;
    
    // Calculate start and end dates for the month with proper date formatting
    const monthNum = parseInt(month);
    const startDate = new Date(christianYear, monthNum - 1, 1);
    const endDate = new Date(christianYear, monthNum, 0); // Last day of the month
    
    const startDateString = format(startDate, 'yyyy-MM-dd');
    const endDateString = format(endDate, 'yyyy-MM-dd');
    
    console.log(`Date range: ${startDateString} to ${endDateString}`);

    // Get all students in the selected classroom
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('classroom', classroom)
      .order('student_number', { ascending: true });

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      throw new Error(`ไม่สามารถดึงข้อมูลนักเรียนได้: ${studentsError.message}`);
    }

    if (!students || students.length === 0) {
      console.log('No students found for classroom:', classroom);
      return { students: [], attendance: {} };
    }

    console.log(`Found ${students.length} students in classroom ${classroom}`);

    // Get all attendance records for these students in the specified month
    const studentIds = students.map(s => s.id);
    
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records')
      .select('*')
      .in('student_id', studentIds)
      .gte('date', startDateString)
      .lte('date', endDateString)
      .order('date', { ascending: true });

    if (attendanceError) {
      console.error('Error fetching attendance records:', attendanceError);
      throw new Error(`ไม่สามารถดึงข้อมูลการเช็คชื่อได้: ${attendanceError.message}`);
    }

    console.log(`Found ${attendanceRecords?.length || 0} attendance records for the month`);

    // Organize attendance data by student and date
    const attendanceMap: Record<string, Record<string, any>> = {};
    
    if (attendanceRecords) {
      attendanceRecords.forEach(record => {
        if (!attendanceMap[record.student_id]) {
          attendanceMap[record.student_id] = {};
        }
        attendanceMap[record.student_id][record.date] = record;
      });
    }

    // Transform students data for the report
    const studentsData = students.map(student => ({
      id: student.id,
      studentNumber: student.student_number,
      firstName: student.first_name,
      lastName: student.last_name,
    }));

    console.log(`Prepared report data for ${studentsData.length} students`);

    return {
      students: studentsData,
      attendance: attendanceMap
    };
    
  } catch (error) {
    console.error('Error fetching attendance report data:', error);
    throw error;
  }
};

// Keep the original function for backward compatibility
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
