
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAlertStudents } from '@/utils/alertStudents';
import { Student } from '@/types';
import { AlertsHeader } from './alerts/AlertsHeader';
import { AlertsLoadingState } from './alerts/AlertsLoadingState';
import { AlertsEmptyState } from './alerts/AlertsEmptyState';
import { AlertsSummary } from './alerts/AlertsSummary';
import { AlertStudentCard } from './alerts/AlertStudentCard';

export default function AlertsPage() {
  const [alertStudents, setAlertStudents] = useState<{ student: Student; consecutiveAbsentDays: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const loadAlertStudents = async (showRefreshToast = false) => {
    try {
      setIsLoading(true);
      console.log('Loading alert students from actual attendance records...');
      const students = await getAlertStudents();
      setAlertStudents(students);
      console.log(`Loaded ${students.length} alert students`);
      
      if (showRefreshToast) {
        toast({
          title: "อัปเดตข้อมูลแล้ว! 🔄",
          description: `พบนักเรียนที่ขาดเรียนต่อเนื่อง ${students.length} คน`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error loading alert students:', error);
      setAlertStudents([]);
      if (showRefreshToast) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลการแจ้งเตือนได้",
          duration: 3000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlertStudents();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAlertStudents(true);
    setIsRefreshing(false);
  };

  if (isLoading) {
    return <AlertsLoadingState />;
  }

  return (
    <div className="p-4 pb-20 thai-content animate-fade-in">
      <AlertsHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      {alertStudents.length === 0 ? (
        <AlertsEmptyState />
      ) : (
        <>
          <AlertsSummary alertCount={alertStudents.length} />
          
          <div className="space-y-3">
            {alertStudents.map(({ student, consecutiveAbsentDays }) => (
              <AlertStudentCard
                key={student.id}
                student={student}
                consecutiveAbsentDays={consecutiveAbsentDays}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
