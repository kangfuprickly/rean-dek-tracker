import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface AlertsSummaryProps {
  alertCount: number;
}

export function AlertsSummary({ alertCount }: AlertsSummaryProps) {
  if (alertCount === 0) return null;

  return (
    <Card className="glass-card mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-600">พบนักเรียนขาดเรียนผิดปกติ</p>
            <p className="text-sm text-gray-600">{alertCount} คน ต้องการการติดตาม</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}