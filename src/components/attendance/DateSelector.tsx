
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

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
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
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : <span>เลือกวันที่</span>}
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
            />
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
}
