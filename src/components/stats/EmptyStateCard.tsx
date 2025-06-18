
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function EmptyStateCard() {
  return (
    <Card className="glass-card">
      <CardContent className="text-center py-12">
        <div className="text-thai-blue-600 mb-4">
          <Users className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">ยังไม่มีข้อมูลนักเรียน</h3>
        <p className="text-gray-600">กรุณานำเข้าข้อมูลนักเรียนผ่านหน้า "นำเข้า" เพื่อเริ่มใช้งานระบบ</p>
      </CardContent>
    </Card>
  );
}
