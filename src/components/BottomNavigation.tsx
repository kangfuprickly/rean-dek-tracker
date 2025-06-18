
import { useState } from 'react';
import { BarChart3, CheckSquare, AlertTriangle, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  {
    id: 'stats',
    label: 'สถิติ',
    icon: BarChart3,
    color: 'text-purple-600'
  },
  {
    id: 'attendance',
    label: 'เช็คชื่อ',
    icon: CheckSquare,
    color: 'text-thai-green-600'
  },
  {
    id: 'alerts',
    label: 'แจ้งเตือน',
    icon: AlertTriangle,
    color: 'text-red-600'
  },
  {
    id: 'import',
    label: 'นำเข้า',
    icon: Upload,
    color: 'text-indigo-600'
  }
];

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-green-50 scale-105" 
                  : "hover:bg-gray-50"
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  "mb-1 transition-colors",
                  isActive ? item.color : "text-gray-400"
                )} 
              />
              <span 
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? item.color : "text-gray-400"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
