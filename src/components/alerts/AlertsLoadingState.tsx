import { RefreshCw } from 'lucide-react';

export function AlertsLoadingState() {
  return (
    <div className="p-4 pb-20 thai-content animate-fade-in">
      <div className="text-center py-12">
        <div className="text-thai-blue-600 mb-4">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin" />
        </div>
        <p className="text-gray-600">กำลังโหลดข้อมูลการแจ้งเตือน...</p>
      </div>
    </div>
  );
}