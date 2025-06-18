
import { useState, useEffect } from 'react';
import { getAttendanceStats, getClassroomStats } from '@/utils/mockData';
import SchoolLogo from './stats/SchoolLogo';
import StatsHeader from './stats/StatsHeader';
import AttendanceSummaryCards from './stats/AttendanceSummaryCards';
import ClassroomStatsCard from './stats/ClassroomStatsCard';
import EmptyStateCard from './stats/EmptyStateCard';
import LoadingState from './stats/LoadingState';
import ExportDataCard from './stats/ExportDataCard';

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

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="p-4 pb-20 thai-content animate-fade-in">
      <SchoolLogo />
      <StatsHeader onRefresh={handleRefresh} refreshing={refreshing} />
      <AttendanceSummaryCards stats={stats} />
      
      {/* Show message when no data */}
      {stats.totalStudents === 0 && <EmptyStateCard />}

      {/* Classroom Statistics - only show when there's data */}
      {stats.totalStudents > 0 && (
        <ClassroomStatsCard classroomStats={classroomStats} />
      )}

      {/* Export Data Section */}
      <div className="mt-6">
        <ExportDataCard />
      </div>
    </div>
  );
}
