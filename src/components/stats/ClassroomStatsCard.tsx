
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
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">สถิติการขาดเรียนตามห้องเรียน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Object.entries(classroomStats)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([classroom, stats]) => {
              // Fix NaN% by checking if total is 0
              const absentRate = stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0;
              const presentRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
              
              return (
                <div key={classroom} className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{classroom}</span>
                    <span className="text-sm text-gray-600">
                      {stats.present}/{stats.total}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-thai-green-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${presentRate}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600">
                    <span className="text-thai-green-600">
                      มาเรียน: {stats.present} คน ({presentRate}%)
                    </span>
                    <span className="text-red-600">
                      ขาดเรียน: {stats.absent} คน ({absentRate}%)
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
