
import { subDays, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { convertDatabaseStudentToAppStudent } from './studentDatabase';

// Function to get alert students (students with 4+ consecutive absences)
export const getAlertStudents = async () => {
  try {
    console.log('Starting alert students calculation...');
    
    // Get attendance records for the last 10 days to ensure we have enough data
    const last10Days = Array.from({ length: 10 }, (_, i) => 
      format(subDays(new Date(), i), 'yyyy-MM-dd')
    );

    console.log('Fetching attendance records for last 10 days:', last10Days);

    const { data: recentRecords, error: recordsError } = await supabase
      .from('attendance_records')
      .select('student_id, date, status')
      .in('date', last10Days)
      .not('student_id', 'is', null)
      .order('date', { ascending: false });

    if (recordsError) {
      console.error('Error fetching attendance records:', recordsError);
      return [];
    }

    console.log(`Found ${recentRecords?.length || 0} attendance records`);

    if (!recentRecords || recentRecords.length === 0) {
      console.log('No attendance records found');
      return [];
    }

    // Group records by student
    const studentRecords: Record<string, any[]> = {};
    recentRecords.forEach(record => {
      if (!studentRecords[record.student_id]) {
        studentRecords[record.student_id] = [];
      }
      studentRecords[record.student_id].push(record);
    });

    console.log(`Grouped records by ${Object.keys(studentRecords).length} students`);

    // Find students with 4+ consecutive absences
    const alertStudentIds: { studentId: string; consecutiveAbsent: number }[] = [];
    
    Object.entries(studentRecords).forEach(([studentId, records]) => {
      // Sort records by date (newest first)
      const sortedRecords = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let consecutiveAbsent = 0;
      // Count consecutive absences from the most recent date
      for (const record of sortedRecords) {
        if (record.status === 'absent') {
          consecutiveAbsent++;
        } else if (record.status === 'present') {
          // Stop counting if we encounter a present day
          break;
        }
      }
      
      if (consecutiveAbsent >= 4) {
        alertStudentIds.push({ studentId, consecutiveAbsent });
        console.log(`Student ${studentId} has ${consecutiveAbsent} consecutive absent days`);
      }
    });

    console.log(`Found ${alertStudentIds.length} students with 4+ consecutive absences`);

    // Only load student details for those with alerts
    if (alertStudentIds.length === 0) {
      return [];
    }

    const { data: alertStudentData, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .in('id', alertStudentIds.map(a => a.studentId));

    if (studentsError) {
      console.error('Error fetching student data:', studentsError);
      return [];
    }

    console.log(`Found ${alertStudentData?.length || 0} student records`);

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

    console.log(`Alert calculation completed. Found ${alertStudents.length} students with alerts`);
    
    return alertStudents;
  } catch (error) {
    console.error('Error in getAlertStudents:', error);
    return [];
  }
};
