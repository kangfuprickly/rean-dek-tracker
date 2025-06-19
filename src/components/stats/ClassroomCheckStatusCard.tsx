
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GradeSection from './classroom/GradeSection';
import StatusLegend from './classroom/StatusLegend';
import { ClassroomStats, sortClassrooms, groupClassroomsByGrade } from './classroom/classroomStatusUtils';

interface ClassroomCheckStatusCardProps {
  classroomStats: Record<string, ClassroomStats>;
}

export default function ClassroomCheckStatusCard({ classroomStats }: ClassroomCheckStatusCardProps) {
  // Sort classrooms by grade and room number - show ALL classrooms, including those with 0 students
  const sortedClassrooms = sortClassrooms(classroomStats);

  if (sortedClassrooms.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">สถานะการเช็คชื่อรายห้องเรียน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            ไม่มีข้อมูลห้องเรียน
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group classrooms by grade for better organization
  const classroomsByGrade = groupClassroomsByGrade(sortedClassrooms);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">สถานะการเช็คชื่อรายห้องเรียน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {Object.entries(classroomsByGrade).map(([grade, classrooms]) => (
            <GradeSection 
              key={grade} 
              grade={grade} 
              classrooms={classrooms} 
            />
          ))}
        </div>
        
        <StatusLegend />
      </CardContent>
    </Card>
  );
}
