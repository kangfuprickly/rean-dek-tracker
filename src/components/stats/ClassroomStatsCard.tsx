
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClassroomStats {
  total: number;
  present: number;
  absent: number;
}

interface ClassroomStatsCardProps {
  classroomStats: Record<string, ClassroomStats>;
}

export default function ClassroomStatsCard({ classroomStats }: ClassroomStatsCardProps) {
  // Sort classrooms by grade and room number
  const sortedClassrooms = Object.entries(classroomStats)
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

  if (sortedClassrooms.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">สถิติการขาดเรียนตามห้องเรียน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            ไม่มีข้อมูลสถิติการเข้าเรียน
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">สถิติการขาดเรียนตามห้องเรียน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedClassrooms.map(([classroom, stats]) => {
              // Ensure all values are valid numbers and prevent division by zero
              const safeTotal = Math.max(0, stats.total || 0);
              const safePresent = Math.min(Math.max(0, stats.present || 0), stats.total || 0);
              const safeAbsent = Math.max(0, (stats.total || 0) - safePresent);
              
              // Calculate rates safely - only show percentage if there are students
              const presentRate = safeTotal > 0 ? Math.round((safePresent / safeTotal) * 100) : 0;
              const absentRate = safeTotal > 0 ? Math.round((safeAbsent / safeTotal) * 100) : 0;
              
              // Show all classrooms, even those with no students
              return (
                <div key={classroom} className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{classroom}</span>
                    <span className="text-sm text-gray-600">
                      {safePresent}/{safeTotal}
                      {safeTotal === 0 && <span className="text-gray-400 ml-1">(ไม่มีนักเรียน)</span>}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-thai-green-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.max(0, presentRate))}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600">
                    <span className="text-thai-green-600">
                      มาเรียน: {safePresent} คน ({presentRate}%)
                    </span>
                    <span className="text-red-600">
                      ขาดเรียน: {safeAbsent} คน ({absentRate}%)
                    </span>
                  </div>
                </div>
              );
            })
          }
        </div>
      </CardContent>
    </Card>
  );
}
