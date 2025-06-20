
import { useState, useEffect } from 'react';
import { getAttendanceStats } from '@/utils/attendanceStats';
import { getClassroomStats } from '@/utils/classroomStats';
import SchoolLogo from './stats/SchoolLogo';
import StatsHeader from './stats/StatsHeader';
import AttendanceSummaryCards from './stats/AttendanceSummaryCards';
import ClassroomCheckStatusCard from './stats/ClassroomCheckStatusCard';
import EmptyStateCard from './stats/EmptyStateCard';
import LoadingState from './stats/LoadingState';
import ExportDataCard from './stats/export/ExportDataCard';
import SchoolClosedCard from './stats/SchoolClosedCard';
import { format } from 'date-fns';

// Helper function to check if a date is a weekend (Friday = 5, Saturday = 6)
const isSchoolClosed = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
};

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
        console.log('[StatsPage] Refreshing stats...');
      } else {
        setLoading(true);
        console.log('[StatsPage] Loading stats...');
      }
      
      const dateToUse = date || selectedDate;
      
      // Check if school is closed on this date
      if (isSchoolClosed(dateToUse)) {
        console.log(`[StatsPage] School is closed on ${format(dateToUse, 'yyyy-MM-dd')}`);
        // Set empty stats for closed days
        setStats({ totalStudents: 0, presentToday: 0, absentToday: 0 });
        setClassroomStats({});
        return;
      }
      
      const dateString = format(dateToUse, 'yyyy-MM-dd');
      
      console.log(`[StatsPage] Fetching stats for date: ${dateString}`);
      const [attendanceStats, classroomData] = await Promise.all([
        getAttendanceStats(dateString),
        getClassroomStats(dateString)
      ]);
      
      console.log('[StatsPage] Received attendance stats:', attendanceStats);
      console.log('[StatsPage] Received classroom stats:', classroomData);
      console.log('[StatsPage] Number of classrooms with data:', Object.keys(classroomData).length);
      
      setStats(attendanceStats);
      setClassroomStats(classroomData);
      console.log('[StatsPage] Stats updated successfully for', dateString);
    } catch (error) {
      console.error('[StatsPage] Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('[StatsPage] Component mounted, fetching initial stats');
    fetchStats();
    
    // Auto-refresh every 60 seconds (reduced from 30 for better performance)
    const interval = setInterval(() => {
      console.log('[StatsPage] Auto-refreshing stats...');
      fetchStats(true);
    }, 60000);
    
    // Listen for attendance updates from other components
    const handleAttendanceUpdate = (event: CustomEvent) => {
      console.log('[StatsPage] Received attendance update event:', event.detail);
      const eventDate = event.detail?.date;
      const currentDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Only refresh if the update is for the currently selected date
      if (eventDate === currentDate) {
        console.log('[StatsPage] Event date matches current date, refreshing stats');
        fetchStats(true);
      } else {
        console.log(`[StatsPage] Event date (${eventDate}) does not match current date (${currentDate}), skipping refresh`);
      }
    };

    window.addEventListener('attendanceUpdated', handleAttendanceUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('attendanceUpdated', handleAttendanceUpdate);
    };
  }, [selectedDate]);

  const handleRefresh = () => {
    console.log('[StatsPage] Manual refresh triggered');
    fetchStats(true);
  };

  const handleDateChange = (date: Date) => {
    console.log(`[StatsPage] Date changed to: ${format(date, 'yyyy-MM-dd')}`);
    setSelectedDate(date);
    fetchStats(false, date);
  };

  if (loading) {
    return <LoadingState />;
  }

  // Check if school is closed on selected date
  if (isSchoolClosed(selectedDate)) {
    return (
      <div className="p-4 pb-20 thai-content animate-fade-in">
        <SchoolLogo />
        <StatsHeader 
          onRefresh={handleRefresh} 
          refreshing={refreshing}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
        <SchoolClosedCard selectedDate={selectedDate} />
      </div>
    );
  }

  // Always show classroom stats since we want to display all classrooms regardless of student count
  const hasClassroomData = Object.keys(classroomStats).length > 0;
  console.log('[StatsPage] Rendering with classroom data:', hasClassroomData, 'Total classrooms:', Object.keys(classroomStats).length);

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
      
      {/* Show message only when there's absolutely no data at all */}
      {stats.totalStudents === 0 && !hasClassroomData && <EmptyStateCard />}

      {/* Classroom Check Status - always show when there's classroom data (including empty classrooms) */}
      {hasClassroomData && (
        <ClassroomCheckStatusCard classroomStats={classroomStats} />
      )}

      {/* Export Data Section */}
      <div className="mt-6">
        <ExportDataCard />
      </div>
    </div>
  );
}
