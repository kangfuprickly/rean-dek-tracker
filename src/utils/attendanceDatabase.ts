
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
  console.log(`[getAttendanceRecordsByDate] Fetching records for date: ${date}`);
  
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('date', date);

  if (error) {
    console.error('[getAttendanceRecordsByDate] Error fetching attendance records:', error);
    throw error;
  }

  console.log(`[getAttendanceRecordsByDate] Found ${data?.length || 0} records for ${date}`);
  return data || [];
};

export const insertAttendanceRecord = async (record: {
  student_id: string;
  date: string;
  status: string;
  reason?: string;
}): Promise<DatabaseAttendanceRecord> => {
  console.log(`[insertAttendanceRecord] Inserting record:`, record);
  
  const { data, error } = await supabase
    .from('attendance_records')
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error('[insertAttendanceRecord] Error inserting attendance record:', error);
    throw error;
  }

  console.log(`[insertAttendanceRecord] Successfully inserted record for student ${record.student_id} on ${record.date}`);
  return data;
};

export const updateAttendanceRecord = async (
  id: string,
  updates: { status?: string; reason?: string }
): Promise<DatabaseAttendanceRecord> => {
  console.log(`[updateAttendanceRecord] Updating record ${id} with:`, updates);
  
  const { data, error } = await supabase
    .from('attendance_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateAttendanceRecord] Error updating attendance record:', error);
    throw error;
  }

  console.log(`[updateAttendanceRecord] Successfully updated record ${id}`);
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

// Fixed function to check for existing records before insert/update
export const upsertAttendanceRecord = async (record: {
  student_id: string;
  date: string;
  status: string;
  reason?: string;
}): Promise<DatabaseAttendanceRecord> => {
  console.log(`[upsertAttendanceRecord] Upserting record for student ${record.student_id} on ${record.date} with status ${record.status}`);
  
  // First check if a record already exists for this student and date
  const { data: existingRecord, error: checkError } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('student_id', record.student_id)
    .eq('date', record.date)
    .maybeSingle();

  if (checkError) {
    console.error('[upsertAttendanceRecord] Error checking for existing record:', checkError);
    throw checkError;
  }

  if (existingRecord) {
    console.log(`[upsertAttendanceRecord] Found existing record ${existingRecord.id}, updating it`);
    // Update existing record
    return await updateAttendanceRecord(existingRecord.id, {
      status: record.status,
      reason: record.reason
    });
  } else {
    console.log(`[upsertAttendanceRecord] No existing record found, creating new one`);
    // Insert new record
    return await insertAttendanceRecord(record);
  }
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
