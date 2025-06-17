
import { supabase } from '@/integrations/supabase/client';
import { AttendanceRecord } from '@/types';

export interface DatabaseAttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: string;
  reason?: string;
  created_at: string;
}

export const getAttendanceRecordsByDate = async (date: string): Promise<DatabaseAttendanceRecord[]> => {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('date', date);

  if (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }

  return data || [];
};

export const insertAttendanceRecord = async (record: {
  student_id: string;
  date: string;
  status: string;
  reason?: string;
}): Promise<DatabaseAttendanceRecord> => {
  const { data, error } = await supabase
    .from('attendance_records')
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error('Error inserting attendance record:', error);
    throw error;
  }

  return data;
};

export const updateAttendanceRecord = async (
  id: string,
  updates: { status?: string; reason?: string }
): Promise<DatabaseAttendanceRecord> => {
  const { data, error } = await supabase
    .from('attendance_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating attendance record:', error);
    throw error;
  }

  return data;
};

export const getAttendanceRecordsByStudentId = async (studentId: string): Promise<DatabaseAttendanceRecord[]> => {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching student attendance records:', error);
    throw error;
  }

  return data || [];
};

// Convert database attendance record to app AttendanceRecord type
export const convertDatabaseAttendanceToAppAttendance = (dbRecord: DatabaseAttendanceRecord): AttendanceRecord => {
  return {
    id: dbRecord.id,
    studentId: dbRecord.student_id,
    date: dbRecord.date,
    status: dbRecord.status as 'present' | 'absent',
    reason: dbRecord.reason || undefined,
    createdAt: dbRecord.created_at
  };
};
