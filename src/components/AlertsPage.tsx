
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getAlertStudents } from '@/utils/mockData';
import { AlertTriangle, UserX, MessageSquare, Phone, FileText } from 'lucide-react';
import { Student } from '@/types';

export default function AlertsPage() {
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [noteText, setNoteText] = useState('');
  const [alertStudents, setAlertStudents] = useState<{ student: Student; consecutiveAbsentDays: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadAlertStudents = async () => {
      try {
        setIsLoading(true);
        const students = await getAlertStudents();
        setAlertStudents(students);
      } catch (error) {
        console.error('Error loading alert students:', error);
        setAlertStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlertStudents();
  }, []);

  const handleNotifyTeacher = (studentName: string) => {
    toast({
      title: "แจ้งครูที่ปรึกษาแล้ว! 📞",
      description: `ส่งการแจ้งเตือนเรื่องนักเรียน ${studentName} ให้ครูที่ปรึกษาเรียบร้อยแล้ว`,
      duration: 3000,
    });
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    
    toast({
      title: "บันทึกหมายเหตุสำเร็จ! 📝",
      description: "บันทึกหมายเหตุและเหตุผลการขาดเรียนเรียบร้อยแล้ว",
      duration: 3000,
    });
    
    setNoteDialogOpen(false);
    setNoteText('');
    setSelectedStudent('');
  };

  const openNoteDialog = (studentId: string, studentName: string) => {
    setSelectedStudent(studentName);
    setNoteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-4 pb-20 thai-content animate-fade-in">
        <div className="text-center py-12">
          <div className="text-thai-blue-600 mb-4">
            <svg className="w-8 h-8 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 thai-content animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">แจ้งเตือนการขาดเรียนผิดปกติ</h1>
        <p className="text-gray-600">นักเรียนที่ขาดเรียนต่อเนื่อง 4 วันขึ้นไป</p>
      </div>

      {alertStudents.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="text-center py-12">
            <div className="text-thai-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ไม่มีการแจ้งเตือน</h3>
            <p className="text-gray-600">ขณะนี้ไม่มีนักเรียนที่ขาดเรียนต่อเนื่องผิดปกติ</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="glass-card mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-600">พบนักเรียนขาดเรียนผิดปกติ</p>
                  <p className="text-sm text-gray-600">{alertStudents.length} คน ต้องการการติดตาม</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible className="space-y-3">
            {alertStudents.map(({ student, consecutiveAbsentDays }, index) => (
              <AccordionItem 
                key={student.id} 
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
                        ขาด {consecutiveAbsentDays} วัน
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
                    
                    <div className="text-sm">
                      <span className="text-gray-600">สถานะการขาดเรียน:</span>
                      <span className="ml-2 text-red-600 font-medium">
                        ขาดเรียนต่อเนื่อง {consecutiveAbsentDays} วัน
                      </span>
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
                      
                      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openNoteDialog(student.id, `${student.firstName} ${student.lastName}`)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            เพิ่มหมายเหตุ
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                          <DialogHeader>
                            <DialogTitle>เพิ่มหมายเหตุ - {selectedStudent}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                เหตุผลการขาดเรียน / หมายเหตุ
                              </label>
                              <Textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="ระบุเหตุผลการขาดเรียนหรือหมายเหตุเพิ่มเติม..."
                                rows={4}
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="outline" 
                                onClick={() => setNoteDialogOpen(false)}
                              >
                                ยกเลิก
                              </Button>
                              <Button 
                                onClick={handleSaveNote}
                                className="bg-thai-blue-600 hover:bg-thai-blue-700 text-white"
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                บันทึก
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      )}
    </div>
  );
}
