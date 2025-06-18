
import { useState, useEffect } from 'react';
import { getAttendanceStats, getClassroomStats } from '@/utils/mockData';
import SchoolLogo from './stats/SchoolLogo';
import StatsHeader from './stats/StatsHeader';
import AttendanceSummaryCards from './stats/AttendanceSummaryCards';
import ClassroomStatsCard from './stats/ClassroomStatsCard';
import EmptyStateCard from './stats/EmptyStateCard';
import LoadingState from './stats/LoadingState';
import ExportDataCard from './stats/ExportDataCard';
import { format } from 'date-fns';

export default function StatsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0
  });
  const [classroomStats, setClassroomStats] = useState<Record<string, { total: number; present: number; absent: number }>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchStats = async (isRefresh = false, date?: Date) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const dateToUse = date || selectedDate;
      const dateString = format(dateToUse, 'yyyy-MM-dd');
      
      console.log(`Fetching stats for date: ${dateString}`);
      const [attendanceStats, classroomData] = await Promise.all([
        getAttendanceStats(dateString),
        getClassroomStats(dateString)
      ]);
      
      setStats(attendanceStats);
      setClassroomStats(classroomData);
      console.log('Stats loaded successfully for', dateString);
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
  }, [selectedDate]);

  const handleRefresh = () => {
    fetchStats(true);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    fetchStats(false, date);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="p-4 pb-20 thai-content animate-fade-in">
      <SchoolLogo />
      <StatsHeader 
        onRefresh={handleRefresh} 
        refreshing={refreshing}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
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
