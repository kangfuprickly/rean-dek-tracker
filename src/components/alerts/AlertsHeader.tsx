import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface AlertsHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function AlertsHeader({ onRefresh, isRefreshing }: AlertsHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-800">แจ้งเตือนการขาดเรียนผิดปกติ</h1>
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          size="sm"
          variant="outline"
          className="bg-white"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </div>
      <p className="text-gray-600">นักเรียนที่ขาดเรียนต่อเนื่อง 4 วันขึ้นไป (จากข้อมูลการเช็คชื่อจริง)</p>
    </div>
  );
}