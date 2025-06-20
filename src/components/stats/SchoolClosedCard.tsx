
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface SchoolClosedCardProps {
  selectedDate: Date;
}

export default function SchoolClosedCard({ selectedDate }: SchoolClosedCardProps) {
  const dayOfWeek = selectedDate.getDay();
  const dayName = dayOfWeek === 5 ? 'วันศุกร์' : 'วันเสาร์';
  
  return (
    <Card className="glass-card">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold text-gray-700 flex items-center justify-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          โรงเรียนปิด
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-blue-50 rounded-lg p-6">
          <Clock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {dayName}
          </h3>
          <p className="text-gray-600 mb-3">
            วันที่ {format(selectedDate, 'dd/MM/yyyy')}
          </p>
          <p className="text-sm text-gray-500">
            โรงเรียนปิดทำการในวันนี้<br />
            ไม่มีการเรียนการสอนและการเช็คชื่อ
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            💡 <strong>หมายเหตุ:</strong> ระบบจะแสดงข้อมูลการเช็คชื่อเฉพาะวันที่มีการเรียนการสอนเท่านั้น
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
