
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface StatsHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function StatsHeader({ onRefresh, refreshing, selectedDate, onDateChange }: StatsHeaderProps) {
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">สถิติการมาเรียน</h1>
          <p className="text-gray-600">
            ข้อมูล ณ วันที่ {format(selectedDate, 'dd/MM/yyyy', { locale: undefined })}
            {isToday && ' (วันนี้)'}
          </p>
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
      
      {/* Date Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          เลือกวันที่เพื่อดูสถิติ
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200",
                "text-gray-800"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-indigo-600" />
              {format(selectedDate, 'dd/MM/yyyy')}
              {isToday && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">วันนี้</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
              className="pointer-events-auto"
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
