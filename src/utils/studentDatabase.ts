
import { supabase } from '@/integrations/supabase/client';
import { Student, AttendanceRecord } from '@/types';

export interface DatabaseStudent {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  grade: string;
  classroom: string;
  created_at: string;
  updated_at: string;
}

export const insertStudents = async (students: Omit<DatabaseStudent, 'id' | 'created_at' | 'updated_at'>[]): Promise<DatabaseStudent[]> => {
  const { data, error } = await supabase
    .from('students')
    .insert(students)
    .select();

  if (error) {
    console.error('Error inserting students:', error);
    throw error;
  }

  return data || [];
};

export const getAllStudents = async (): Promise<DatabaseStudent[]> => {
  // Remove any limits and get all students
  let allStudents: DatabaseStudent[] = [];
  let from = 0;
  const batchSize = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('classroom', { ascending: true })
      .order('student_number', { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) {
      console.error('Error fetching students:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    allStudents = [...allStudents, ...data];
    
    // If we got less than the batch size, we've reached the end
    if (data.length < batchSize) {
      break;
    }
    
    from += batchSize;
  }

  console.log(`Total students fetched: ${allStudents.length}`);
  return allStudents;
};

export const getStudentsByClassroom = async (classroom: string): Promise<DatabaseStudent[]> => {
  // Remove any limits and get all students for the classroom
  let allStudents: DatabaseStudent[] = [];
  let from = 0;
  const batchSize = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('classroom', classroom)
      .order('student_number', { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) {
      console.error('Error fetching students by classroom:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    allStudents = [...allStudents, ...data];
    
    // If we got less than the batch size, we've reached the end
    if (data.length < batchSize) {
      break;
    }
    
    from += batchSize;
  }

  return allStudents;
};

export const deleteAllStudents = async (): Promise<void> => {
  const { error } = await supabase
    .from('students')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all students

  if (error) {
    console.error('Error deleting students:', error);
    throw error;
  }
};

// Convert database student to app Student type
export const convertDatabaseStudentToAppStudent = (dbStudent: DatabaseStudent): Student => {
  return {
    id: dbStudent.id,
    studentNumber: dbStudent.student_number,
    firstName: dbStudent.first_name,
    lastName: dbStudent.last_name,
    grade: dbStudent.grade,
    classroom: dbStudent.classroom,
    attendanceRecords: [], // Will be populated separately when needed
    notes: ''
  };
};
