
import { subDays, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { convertDatabaseStudentToAppStudent } from './studentDatabase';

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
