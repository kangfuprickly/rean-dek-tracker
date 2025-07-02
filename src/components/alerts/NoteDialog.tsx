import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare } from 'lucide-react';

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
}

export function NoteDialog({ open, onOpenChange, studentName }: NoteDialogProps) {
  const [noteText, setNoteText] = useState('');
  const { toast } = useToast();

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    
    toast({
      title: "บันทึกหมายเหตุสำเร็จ! 📝",
      description: "บันทึกหมายเหตุและเหตุผลการขาดเรียนเรียบร้อยแล้ว",
      duration: 3000,
    });
    
    onOpenChange(false);
    setNoteText('');
  };

  const handleCancel = () => {
    onOpenChange(false);
    setNoteText('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>เพิ่มหมายเหตุ - {studentName}</DialogTitle>
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
              onClick={handleCancel}
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
  );
}