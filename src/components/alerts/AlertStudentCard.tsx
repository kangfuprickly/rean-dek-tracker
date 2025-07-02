import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserX, Phone, FileText } from 'lucide-react';
import { Student } from '@/types';
import { NoteDialog } from './NoteDialog';

interface AlertStudentCardProps {
  student: Student;
  consecutiveAbsentDays: number;
}

export function AlertStudentCard({ student, consecutiveAbsentDays }: AlertStudentCardProps) {
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleNotifyTeacher = (studentName: string) => {
    toast({
      title: "แจ้งครูที่ปรึกษาแล้ว! 📞",
      description: `ส่งการแจ้งเตือนเรื่องนักเรียน ${studentName} ให้ครูที่ปรึกษาเรียบร้อยแล้ว`,
      duration: 3000,
    });
  };

  const openNoteDialog = () => {
    setNoteDialogOpen(true);
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem 
        value={student.id}
        className="border border-red-200 rounded-lg bg-red-50/50"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center justify-between w-full mr-4">
            <div className="flex items-center gap-3">
              <UserX className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {student.classroom} • เลขประจำตัว: {student.studentNumber}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                ขาดต่อเนื่อง {consecutiveAbsentDays} วัน
              </span>
            </div>
          </div>
        </AccordionTrigger>
        
        <AccordionContent className="px-4 pb-4">
          <div className="bg-white rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">ห้องเรียน:</span>
                <span className="ml-2 font-medium">{student.classroom}</span>
              </div>
              <div>
                <span className="text-gray-600">เลขประจำตัว:</span>
                <span className="ml-2 font-medium">{student.studentNumber}</span>
              </div>
            </div>
            
            <div className="text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              <span className="text-gray-700 font-medium">สถานะการขาดเรียน:</span>
              <div className="mt-1">
                <span className="text-red-600 font-medium">
                  ⚠️ ขาดเรียนต่อเนื่อง {consecutiveAbsentDays} วัน
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                ข้อมูลจากการเช็คชื่อในฐานข้อมูล
              </p>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                onClick={() => handleNotifyTeacher(`${student.firstName} ${student.lastName}`)}
                className="bg-thai-blue-600 hover:bg-thai-blue-700 text-white"
              >
                <Phone className="w-4 h-4 mr-1" />
                แจ้งครูที่ปรึกษา
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={openNoteDialog}
              >
                <FileText className="w-4 h-4 mr-1" />
                เพิ่มหมายเหตุ
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <NoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        studentName={`${student.firstName} ${student.lastName}`}
      />
    </Accordion>
  );
}