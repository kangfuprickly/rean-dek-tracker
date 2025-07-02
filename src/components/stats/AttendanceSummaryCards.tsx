
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, TrendingUp, Clock } from 'lucide-react';
import { getCheckStatus, ClassroomStats } from './classroom/classroomStatusUtils';

interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
}

interface AttendanceSummaryCardsProps {
  stats: AttendanceStats;
  classroomStats: Record<string, ClassroomStats>;
}

export default function AttendanceSummaryCards({ stats, classroomStats }: AttendanceSummaryCardsProps) {
  // คำนวณจากนักเรียนทั้งหมดในระบบเป็นฐาน (Base)
  const totalChecked = stats.presentToday + stats.absentToday;
  const notCheckedYet = stats.totalStudents - totalChecked;
  
  // อัตราการมาเรียน = (จำนวนมาเรียน / นักเรียนทั้งหมด) * 100
  const attendanceRate = stats.totalStudents > 0 ? Math.round((stats.presentToday / stats.totalStudents) * 100) : 0;
  
  // เปอร์เซ็นต์ของนักเรียนที่ยังไม่ได้เช็คชื่อ
  const notCheckedPercentage = stats.totalStudents > 0 ? Math.round((notCheckedYet / stats.totalStudents) * 100) : 0;

  // หาห้องเรียนที่ยังไม่ได้เช็คชื่อ
  const notCheckedClassrooms = Object.entries(classroomStats)
    .filter(([_, classStats]) => {
      const status = getCheckStatus(classStats);
      return status === 'not-checked' && classStats.total > 0; // เฉพาะห้องที่มีนักเรียนและยังไม่เช็ค
    })
    .map(([classroom]) => classroom)
    .sort((a, b) => {
      // เรียงตามลำดับห้อง
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

  // สร้างข้อความสำหรับแสดงรายชื่อห้องเรียน
  const getNotCheckedDisplay = () => {
    if (notCheckedClassrooms.length === 0) {
      return "เช็คชื่อครบทุกห้องแล้ว";
    }
    
    // แสดงเฉพาะหมายเลขห้อง เช่น 1/1, 2/2, 3/3
    const roomNumbers = notCheckedClassrooms.map(classroom => {
      const match = classroom.match(/ม\.(\d+)\/(\d+)/);
      return match ? `${match[1]}/${match[2]}` : classroom;
    });
    
    return roomNumbers.join(', ');
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">นักเรียนทั้งหมด</p>
              <p className="text-2xl font-bold text-thai-blue-600">{stats.totalStudents.toLocaleString()}</p>
              <p className="text-xs text-gray-500">ฐานข้อมูลทั้งระบบ</p>
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
              <p className="text-xs text-gray-500">
                {stats.totalStudents > 0 ? Math.round((stats.presentToday / stats.totalStudents) * 100) : 0}% ของทั้งหมด
              </p>
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
              <p className="text-xs text-gray-500">
                {stats.totalStudents > 0 ? Math.round((stats.absentToday / stats.totalStudents) * 100) : 0}% ของทั้งหมด
              </p>
            </div>
            <UserX className="w-8 h-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card col-span-2">
        <CardContent className="p-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">ยังไม่ได้เช็คชื่อ</p>
            {notCheckedClassrooms.length > 0 ? (
              <div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {notCheckedClassrooms.map((classroom, index) => {
                    const match = classroom.match(/ม\.(\d+)\/(\d+)/);
                    const roomNumber = match ? `${match[1]}/${match[2]}` : classroom;
                    return (
                      <span
                        key={classroom}
                        className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm font-medium"
                      >
                        {roomNumber}
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500">
                  {notCheckedClassrooms.length} ห้องเรียน ({notCheckedYet.toLocaleString()} คน)
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-bold text-thai-green-600 mb-1">เช็คชื่อครบทุกห้องแล้ว</p>
                <p className="text-xs text-gray-500">
                  ทุกห้องเช็คชื่อครบแล้ว ({totalChecked.toLocaleString()} คนเช็คแล้ว)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
