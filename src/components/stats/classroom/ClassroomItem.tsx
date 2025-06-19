
import { Badge } from '@/components/ui/badge';
import { ClassroomStats, getCheckStatus, getStatusDisplay } from './classroomStatusUtils';

interface ClassroomItemProps {
  classroom: string;
  stats: ClassroomStats;
}

export default function ClassroomItem({ classroom, stats }: ClassroomItemProps) {
  const status = getCheckStatus(stats);
  const display = getStatusDisplay(status, stats);
  
  return (
    <div 
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
      
      {/* แสดงรายละเอียดการมาเรียน/ขาดเรียน เฉพาะกรณีที่มีการเช็คชื่อแล้ว */}
      {(status === 'completed' || status === 'partial') && (
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
}
