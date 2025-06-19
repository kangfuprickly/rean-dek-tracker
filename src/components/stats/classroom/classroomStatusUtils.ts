
import { Check, X, Hourglass } from 'lucide-react';

export interface ClassroomStats {
  total: number;
  present: number;
  absent: number;
}

export type StatusType = 'completed' | 'partial' | 'no-students' | 'not-checked';

export const getCheckStatus = (stats: ClassroomStats): StatusType => {
  // If there are no students in the classroom, show as "no students"
  if (stats.total === 0) {
    return 'no-students';
  }
  
  const totalChecked = stats.present + stats.absent;
  
  // หากมีการเช็คชื่อครบตามจำนวนนักเรียนทั้งหมด = เช็คแล้ว
  if (totalChecked === stats.total) {
    return 'completed';
  } else if (totalChecked > 0) {
    // มีการเช็คชื่อบางส่วน = เช็คบางส่วน
    return 'partial';
  } else {
    // ไม่มีการเช็คชื่อเลย = ยังไม่เช็ค
    return 'not-checked';
  }
};

export const getStatusDisplay = (status: StatusType, stats: ClassroomStats) => {
  const totalChecked = stats.present + stats.absent;
  
  switch (status) {
    case 'completed':
      return {
        icon: <Check className="w-5 h-5" />,
        text: 'เช็คแล้ว',
        badge: 'เสร็จสิ้น',
        color: 'bg-green-100 text-green-800 border-green-200',
        iconColor: 'text-green-600'
      };
    case 'partial':
      return {
        icon: <Hourglass className="w-5 h-5" />,
        text: 'เช็คบางส่วน',
        badge: `${totalChecked}/${stats.total}`,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        iconColor: 'text-yellow-600'
      };
    case 'no-students':
      return {
        icon: <X className="w-4 h-4" />,
        text: 'ไม่มีนักเรียน',
        badge: 'ว่าง',
        color: 'bg-gray-100 text-gray-600 border-gray-200',
        iconColor: 'text-gray-500'
      };
    case 'not-checked':
    default:
      return {
        icon: <X className="w-5 h-5" />,
        text: 'ยังไม่เช็ค',
        badge: 'รอดำเนินการ',
        color: 'bg-red-100 text-red-800 border-red-200',
        iconColor: 'text-red-600'
      };
  }
};

export const sortClassrooms = (classroomStats: Record<string, ClassroomStats>) => {
  return Object.entries(classroomStats)
    .sort(([a], [b]) => {
      // Extract grade and room number for proper sorting
      const parseClassroom = (classroom: string) => {
        const match = classroom.match(/ม\.(\d+)\/(\d+)/);
        if (match) {
          return { grade: parseInt(match[1]), room: parseInt(match[2]) };
        }
        return { grade: 0, room: 0 };
      };
      
      const aData = parseClassroom(a);
      const bData = parseClassroom(b);
      
      if (aData.grade !== bData.grade) {
        return aData.grade - bData.grade;
      }
      return aData.room - bData.room;
    });
};

export const groupClassroomsByGrade = (sortedClassrooms: Array<[string, ClassroomStats]>) => {
  return sortedClassrooms.reduce((acc, [classroom, stats]) => {
    const match = classroom.match(/ม\.(\d+)/);
    const grade = match ? `ม.${match[1]}` : 'อื่นๆ';
    
    if (!acc[grade]) {
      acc[grade] = [];
    }
    acc[grade].push([classroom, stats]);
    return acc;
  }, {} as Record<string, Array<[string, ClassroomStats]>>);
};
