
export interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  grade: string;
  classroom: string;
  attendanceRecords: AttendanceRecord[];
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent';
  reason?: string;
  createdAt: string;
}

export interface ClassroomData {
  grade: string;
  classroom: string;
  totalStudents: number;
  presentToday: number;
  absentToday: number;
}

export interface AlertStudent {
  student: Student;
  consecutiveAbsentDays: number;
  lastAttendanceDate: string;
}

export interface ExcelStudentData {
  เลขประจำตัว: string;
  ชั้น: string;
  ห้อง: string;
  'ชื่อ-สกุล': string;
}

export type Grade = 'ม.1' | 'ม.2' | 'ม.3' | 'ม.4' | 'ม.5' | 'ม.6';

export const GRADE_CLASSROOMS: Record<Grade, string[]> = {
  'ม.1': Array.from({length: 12}, (_, i) => `ม.1/${i + 1}`),
  'ม.2': Array.from({length: 12}, (_, i) => `ม.2/${i + 1}`),
  'ม.3': Array.from({length: 9}, (_, i) => `ม.3/${i + 1}`),
  'ม.4': Array.from({length: 7}, (_, i) => `ม.4/${i + 1}`),
  'ม.5': Array.from({length: 8}, (_, i) => `ม.5/${i + 1}`),
  'ม.6': Array.from({length: 7}, (_, i) => `ม.6/${i + 1}`),
};
