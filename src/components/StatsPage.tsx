
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
      console.log('Classroom stats:', classroomData);
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
    
    // Listen for attendance updates from other components
    const handleAttendanceUpdate = (event: CustomEvent) => {
      console.log('Received attendance update event:', event.detail);
      const eventDate = event.detail?.date;
      const currentDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Only refresh if the update is for the currently selected date
      if (eventDate === currentDate) {
        console.log('Refreshing stats due to attendance update');
        fetchStats(true);
      }
    };

    window.addEventListener('attendanceUpdated', handleAttendanceUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('attendanceUpdated', handleAttendanceUpdate);
    };
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

  // Show classroom stats even when total students is 0, as long as we have classroom data
  const hasClassroomData = Object.keys(classroomStats).length > 0;

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
      
      {/* Show message when no data at all */}
      {stats.totalStudents === 0 && !hasClassroomData && <EmptyStateCard />}

      {/* Classroom Statistics - show when there's classroom data */}
      {hasClassroomData && (
        <ClassroomStatsCard classroomStats={classroomStats} />
      )}

      {/* Export Data Section */}
      <div className="mt-6">
        <ExportDataCard />
      </div>
    </div>
  );
}
