
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
}

// Helper function to check if a date is a weekend (Friday = 5, Saturday = 6)
const isSchoolClosed = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
};

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const isSelectedDateClosed = isSchoolClosed(selectedDate);
  
  return (
    <Card className="glass-card mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-thai-blue-600" />
          เลือกวันที่
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground",
                isSelectedDateClosed && "border-red-300 bg-red-50 text-red-700"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : <span>เลือกวันที่</span>}
              {isSelectedDateClosed && (
                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  โรงเรียนปิด
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              initialFocus
              className="pointer-events-auto"
              disabled={(date) => date > new Date()} // Disable future dates
              modifiers={{
                schoolClosed: (date) => isSchoolClosed(date)
              }}
              modifiersStyles={{
                schoolClosed: {
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  textDecoration: 'line-through'
                }
              }}
            />
          </PopoverContent>
        </Popover>
        
        {isSelectedDateClosed && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              ⚠️ วันที่เลือกเป็นวันหยุดของโรงเรียน (วันศุกร์/เสาร์)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
