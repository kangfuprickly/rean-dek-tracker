
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Hourglass } from 'lucide-react';

interface ClassroomStats {
  total: number;
  present: number;
  absent: number;
}

interface ClassroomCheckStatusCardProps {
  classroomStats: Record<string, ClassroomStats>;
}

export default function ClassroomCheckStatusCard({ classroomStats }: ClassroomCheckStatusCardProps) {
  // Sort classrooms by grade and room number - show ALL classrooms, including those with 0 students
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
  const classroomsByGrade = sortedClassrooms.reduce((acc, [classroom, stats]) => {
    const match = classroom.match(/ม\.(\d+)/);
    const grade = match ? `ม.${match[1]}` : 'อื่นๆ';
    
    if (!acc[grade]) {
      acc[grade] = [];
    }
    acc[grade].push([classroom, stats]);
    return acc;
  }, {} as Record<string, Array<[string, ClassroomStats]>>);

  const getCheckStatus = (stats: ClassroomStats) => {
    // If there are no students in the classroom, show as "no students"
    if (stats.total === 0) {
      return 'no-students';
    }
    
    const totalChecked = stats.present + stats.absent;
    
    // If no attendance records exist, it's not checked
    if (totalChecked === 0) {
      return 'not-checked';
    } else if (totalChecked === stats.total) {
      // All students have been checked
      return 'completed';
    } else {
      // Partially checked
      return 'partial';
    }
  };

  const getStatusDisplay = (status: string, stats: ClassroomStats) => {
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

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">สถานะการเช็คชื่อรายห้องเรียน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {Object.entries(classroomsByGrade).map(([grade, classrooms]) => (
            <div key={grade} className="space-y-3">
              <h3 className="font-medium text-gray-700 border-b border-gray-200 pb-1">
                {grade}
              </h3>
              
              <div className="grid grid-cols-1 gap-2">
                {classrooms.map(([classroom, stats]) => {
                  const status = getCheckStatus(stats);
                  const display = getStatusDisplay(status, stats);
                  
                  return (
                    <div 
                      key={classroom} 
                      className={`rounded-lg p-3 border transition-all duration-200 ${display.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`${display.iconColor}`}>
                            {display.icon}
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">
                              {classroom}
                            </span>
                            <div className="text-sm text-gray-600">
                              {display.text}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant="outline" className={`${display.color} border`}>
                            {display.badge}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            จำนวน {stats.total} คน
                          </div>
                        </div>
                      </div>
                      
                      {status !== 'not-checked' && status !== 'no-students' && (
                        <div className="mt-3 pt-2 border-t border-gray-200/50">
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600">
                              มาเรียน: {stats.present} คน
                            </span>
                            <span className="text-red-600">
                              ขาดเรียน: {stats.absent} คน
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary at the bottom */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">เช็คแล้ว</span>
            </div>
            <div className="flex items-center gap-2">
              <Hourglass className="w-4 h-4 text-yellow-600" />
              <span className="text-gray-600">เช็คบางส่วน</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-red-600" />
              <span className="text-gray-600">ยังไม่เช็ค</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
