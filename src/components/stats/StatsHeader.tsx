
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface StatsHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
}

export default function StatsHeader({ onRefresh, refreshing }: StatsHeaderProps) {
  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">สถิติการมาเรียน</h1>
        <p className="text-gray-600">ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH')}</p>
      </div>
      <Button
        onClick={onRefresh}
        disabled={refreshing}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'กำลังอัปเดต...' : 'อัปเดต'}
      </Button>
    </div>
  );
}
