
import { Check, X, Hourglass } from 'lucide-react';

export default function StatusLegend() {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">เช็คแล้ว</span>
        </div>
        <div className="flex items-center gap-2">
          <Hourglass className="w-4 h-4 text-yellow-600" />
          <span className="text-gray-600">เช็คบางส่วน</span>
        </div>
        <div className="flex items-center gap-2">
          <X className="w-4 h-4 text-red-600" />
          <span className="text-gray-600">ยังไม่เช็ค</span>
        </div>
      </div>
    </div>
  );
}
