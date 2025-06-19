
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, TrendingUp, Clock } from 'lucide-react';

interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
}

interface AttendanceSummaryCardsProps {
  stats: AttendanceStats;
}

export default function AttendanceSummaryCards({ stats }: AttendanceSummaryCardsProps) {
  // คำนวณจากนักเรียนทั้งหมดในระบบ
  const totalChecked = stats.presentToday + stats.absentToday;
  const notCheckedYet = stats.totalStudents - totalChecked;
  const attendanceRate = stats.totalStudents > 0 ? Math.round((stats.presentToday / stats.totalStudents) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">นักเรียนทั้งหมด</p>
              <p className="text-2xl font-bold text-thai-blue-600">{stats.totalStudents.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-thai-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">อัตราการมาเรียน</p>
              <p className="text-2xl font-bold text-thai-green-600">{attendanceRate}%</p>
              <p className="text-xs text-gray-500">จากนักเรียนทั้งหมด {stats.totalStudents.toLocaleString()} คน</p>
            </div>
            <TrendingUp className="w-8 h-8 text-thai-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">มาเรียนวันนี้</p>
              <p className="text-2xl font-bold text-thai-green-600">{stats.presentToday.toLocaleString()}</p>
            </div>
            <UserCheck className="w-8 h-8 text-thai-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">ขาดเรียนวันนี้</p>
              <p className="text-2xl font-bold text-red-600">{stats.absentToday.toLocaleString()}</p>
            </div>
            <UserX className="w-8 h-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card col-span-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">ยังไม่ได้เช็คชื่อ</p>
              <p className="text-2xl font-bold text-orange-600">{notCheckedYet.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {stats.totalStudents > 0 ? Math.round((notCheckedYet / stats.totalStudents) * 100) : 0}% 
                ของนักเรียนทั้งหมด
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
