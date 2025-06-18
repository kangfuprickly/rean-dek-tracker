
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAttendanceStats, getClassroomStats } from '@/utils/mockData';
import { Users, UserCheck, UserX, TrendingUp, RefreshCw } from 'lucide-react';

export default function StatsPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0
  });
  const [classroomStats, setClassroomStats] = useState<Record<string, { total: number; present: number; absent: number }>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      console.log('Fetching optimized stats...');
      const [attendanceStats, classroomData] = await Promise.all([
        getAttendanceStats(),
        getClassroomStats()
      ]);
      
      setStats(attendanceStats);
      setClassroomStats(classroomData);
      console.log('Stats loaded successfully');
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 60 seconds (reduced from 30 for better performance)
    const interval = setInterval(() => {
      fetchStats(true);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchStats(true);
  };
  
  const attendanceRate = stats.totalStudents > 0 ? Math.round((stats.presentToday / stats.totalStudents) * 100) : 0;

  if (loading) {
    return (
      <div className="p-4 pb-20 thai-content animate-fade-in">
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/7c8bfb65-dae8-4dd5-b7c2-fd80778d6c16.png" 
            alt="โลโก้โรงเรียน TARBIA CARE" 
            className="h-20 w-auto object-contain"
          />
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thai-blue-600"></div>
          <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 thai-content animate-fade-in">
      {/* School Logo */}
      <div className="flex justify-center mb-6">
        <img 
          src="/lovable-uploads/7c8bfb65-dae8-4dd5-b7c2-fd80778d6c16.png" 
          alt="โลโก้โรงเรียน TARBIA CARE" 
          className="h-20 w-auto object-contain"
        />
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">สถิติการมาเรียน</h1>
          <p className="text-gray-600">ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH')}</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'กำลังอัปเดต...' : 'อัปเดต'}
        </Button>
      </div>

      {/* Summary Cards */}
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
      </div>

      {/* Show message when no data */}
      {stats.totalStudents === 0 && (
        <Card className="glass-card">
          <CardContent className="text-center py-12">
            <div className="text-thai-blue-600 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ยังไม่มีข้อมูลนักเรียน</h3>
            <p className="text-gray-600">กรุณานำเข้าข้อมูลนักเรียนผ่านหน้า "นำเข้า" เพื่อเริ่มใช้งานระบบ</p>
          </CardContent>
        </Card>
      )}

      {/* Classroom Statistics - only show when there's data */}
      {stats.totalStudents > 0 && (
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
      )}
    </div>
  );
}
