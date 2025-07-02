import { Card, CardContent } from '@/components/ui/card';
import { UserX } from 'lucide-react';

export function AlertsEmptyState() {
  return (
    <Card className="glass-card">
      <CardContent className="text-center py-12">
        <div className="text-thai-green-600 mb-4">
          <UserX className="w-16 h-16 mx-auto opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">ไม่มีการแจ้งเตือน</h3>
        <p className="text-gray-600">ขณะนี้ไม่มีนักเรียนที่ขาดเรียนต่อเนื่อง 4 วันขึ้นไป</p>
        <p className="text-sm text-gray-500 mt-2">
          ข้อมูลจากการเช็คชื่อในฐานข้อมูล
        </p>
      </CardContent>
    </Card>
  );
}