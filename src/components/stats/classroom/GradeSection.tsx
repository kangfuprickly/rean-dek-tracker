
import ClassroomItem from './ClassroomItem';
import { ClassroomStats } from './classroomStatusUtils';

interface GradeSectionProps {
  grade: string;
  classrooms: Array<[string, ClassroomStats]>;
}

export default function GradeSection({ grade, classrooms }: GradeSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-700 border-b border-gray-200 pb-1">
        {grade}
      </h3>
      
      <div className="grid grid-cols-1 gap-2">
        {classrooms.map(([classroom, stats]) => (
          <ClassroomItem 
            key={classroom} 
            classroom={classroom} 
            stats={stats} 
          />
        ))}
      </div>
    </div>
  );
}
