
import SchoolLogo from './SchoolLogo';

export default function LoadingState() {
  return (
    <div className="p-4 pb-20 thai-content animate-fade-in">
      <SchoolLogo />
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thai-blue-600"></div>
        <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    </div>
  );
}
