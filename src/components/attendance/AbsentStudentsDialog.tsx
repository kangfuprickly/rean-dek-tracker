
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserX, Calendar, Users } from 'lucide-react';
import { Student } from '@/types';
import { format } from 'date-fns';

interface AbsentStudentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  absentStudents: Student[];
  selectedDate: Date;
  classroom: string;
}

export default function AbsentStudentsDialog({
  isOpen,
  onClose,
  absentStudents,
  selectedDate,
  classroom
}: AbsentStudentsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center text-red-600 flex items-center justify-center gap-2">
            <UserX className="w-5 h-5" />
            รายชื่อนักเรียนที่ขาดเรียน
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Summary Card */}
          <Card className="glass-card border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{format(selectedDate, 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{classroom}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{absentStudents.length}</p>
                <p className="text-sm text-gray-600">คนขาดเรียน</p>
              </div>
            </CardContent>
          </Card>

          {/* Absent Students List */}
          {absentStudents.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800 text-sm">รายชื่อนักเรียนที่ขาดเรียน:</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {absentStudents.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-red-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        เลขที่ {student.studentNumber}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-thai-green-600 mb-4">
                <Users className="w-16 h-16 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-thai-green-600 mb-2">
                ไม่มีนักเรียนขาดเรียน! 🎉
              </h3>
              <p className="text-gray-600">นักเรียนมาเรียนครบทุกคน</p>
            </div>
          )}

          {/* Close Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-thai-blue-600 hover:bg-thai-blue-700 text-white"
          >
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
