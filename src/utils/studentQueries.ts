import { Student } from '../types';
import { getAllStudents, convertDatabaseStudentToAppStudent } from './studentDatabase';
import { getAttendanceRecordsByStudentId, convertDatabaseAttendanceToAppAttendance } from './attendanceDatabase';

// Get students by classroom from database with their attendance records
export const getStudentsByClassroom = async (classroom: string): Promise<Student[]> => {
  try {
    const { getStudentsByClassroom: getDbStudentsByClassroom } = await import('./studentDatabase');
    const dbStudents = await getDbStudentsByClassroom(classroom);
    
    console.log(`Fetched ${dbStudents.length} students for classroom ${classroom}`);
    
    // Get attendance records for each student in batches to avoid overwhelming the database
    const batchSize = 50;
    const studentsWithAttendance: Student[] = [];
    
    for (let i = 0; i < dbStudents.length; i += batchSize) {
      const batch = dbStudents.slice(i, i + batchSize);
      const batchPromises = batch.map(async (dbStudent) => {
        const attendanceRecords = await getAttendanceRecordsByStudentId(dbStudent.id);
        const appStudent = convertDatabaseStudentToAppStudent(dbStudent);
        appStudent.attendanceRecords = attendanceRecords.map(convertDatabaseAttendanceToAppAttendance);
        return appStudent;
      });
      
      const batchResults = await Promise.all(batchPromises);
      studentsWithAttendance.push(...batchResults);
    }
    
    return studentsWithAttendance;
  } catch (error) {
    console.error('Error fetching students by classroom:', error);
    return [];
  }
};

// Keep the original function for cases where full student data is needed
export const getAllStudentsFromDb = async (): Promise<Student[]> => {
  try {
    const dbStudents = await getAllStudents();
    console.log(`Fetched ${dbStudents.length} total students from database`);
    
    // Get attendance records for each student in batches to improve performance
    const batchSize = 50;
    const studentsWithAttendance: Student[] = [];
    
    for (let i = 0; i < dbStudents.length; i += batchSize) {
      const batch = dbStudents.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(dbStudents.length / batchSize)}`);
      
      const batchPromises = batch.map(async (dbStudent) => {
        const attendanceRecords = await getAttendanceRecordsByStudentId(dbStudent.id);
        const appStudent = convertDatabaseStudentToAppStudent(dbStudent);
        appStudent.attendanceRecords = attendanceRecords.map(convertDatabaseAttendanceToAppAttendance);
        return appStudent;
      });
      
      const batchResults = await Promise.all(batchPromises);
      studentsWithAttendance.push(...batchResults);
    }
    
    console.log(`Final processed students count: ${studentsWithAttendance.length}`);
    return studentsWithAttendance;
  } catch (error) {
    console.error('Error fetching all students:', error);
    return [];
  }
};
