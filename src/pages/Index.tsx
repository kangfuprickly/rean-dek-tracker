
import { useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import StatsPage from '@/components/StatsPage';
import AttendancePage from '@/components/AttendancePage';
import AlertsPage from '@/components/AlertsPage';
import ImportPage from '@/components/ImportPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('stats');

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'stats':
        return <StatsPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'alerts':
        return <AlertsPage />;
      case 'import':
        return <ImportPage />;
      default:
        return <StatsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-thai-blue-50 to-thai-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-center text-gray-800">
            ระบบติดตามการมาเรียนของนักเรียน
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto min-h-screen">
        {renderCurrentPage()}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  );
};

export default Index;
