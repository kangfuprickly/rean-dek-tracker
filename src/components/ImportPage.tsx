import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileSpreadsheet, Check, X, Users, Trash2 } from 'lucide-react';
import { ExcelStudentData } from '@/types';
import * as XLSX from 'xlsx';
import { insertStudents, deleteAllStudents, getAllStudents, DatabaseStudent } from '@/utils/studentDatabase';

interface PreviewStudent {
  studentNumber: string;
  grade: string;
  classroom: string;
  fullName: string;
  firstName: string;
  lastName: string;
  isValid: boolean;
  errors: string[];
}

export default function ImportPage() {
  const [previewData, setPreviewData] = useState<PreviewStudent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [existingStudents, setExistingStudents] = useState<DatabaseStudent[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateStudentData = (data: any): PreviewStudent => {
    const errors: string[] = [];
    let isValid = true;

    const studentNumber = data['เลขประจำตัว']?.toString().trim() || '';
    const grade = data['ชั้น']?.toString().trim() || '';
    const room = data['ห้อง']?.toString().trim() || '';
    const fullName = data['ชื่อ-สกุล']?.toString().trim() || '';

    if (!studentNumber) {
      errors.push('ไม่มีเลขประจำตัว');
      isValid = false;
    }

    if (!grade) {
      errors.push('ไม่มีข้อมูลชั้น');
      isValid = false;
    }

    if (!room) {
      errors.push('ไม่มีข้อมูลห้อง');
      isValid = false;
    }

    if (!fullName) {
      errors.push('ไม่มีชื่อ-สกุล');
      isValid = false;
    }

    // Split full name into first and last name
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    if (!firstName) {
      errors.push('ไม่สามารถแยกชื่อได้');
      isValid = false;
    }

    return {
      studentNumber,
      grade,
      classroom: `${grade}/${room}`,
      fullName,
      firstName,
      lastName,
      isValid,
      errors
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Excel data:', jsonData);

      const processedData = jsonData.map(validateStudentData);
      setPreviewData(processedData);

      toast({
        title: "อ่านไฟล์สำเร็จ! 📊",
        description: `อ่านข้อมูลจากไฟล์ ${file.name} ได้ ${processedData.length} รายการ`,
        duration: 3000,
      });

    } catch (error) {
      console.error('Error reading Excel file:', error);
      toast({
        title: "เกิดข้อผิดพลาด! ❌",
        description: "ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    const validData = previewData.filter(item => item.isValid);
    
    if (validData.length === 0) {
      toast({
        title: "ไม่มีข้อมูลที่ถูกต้อง! ⚠️",
        description: "กรุณาตรวจสอบและแก้ไขข้อมูลในไฟล์",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const studentsToInsert = validData.map(student => ({
        student_number: student.studentNumber,
        first_name: student.firstName,
        last_name: student.lastName,
        full_name: student.fullName,
        grade: student.grade,
        classroom: student.classroom
      }));

      await insertStudents(studentsToInsert);
      
      toast({
        title: "นำเข้าข้อมูลสำเร็จ! ✅",
        description: `เพิ่มข้อมูลนักเรียน ${validData.length} คน เข้าสู่ระบบเรียบร้อยแล้ว`,
        duration: 3000,
      });

      // Reset form
      setPreviewData([]);
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh existing students list
      await loadExistingStudents();
      
    } catch (error: any) {
      console.error('Error inserting students:', error);
      
      let errorMessage = "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      if (error.code === '23505') {
        errorMessage = "มีเลขประจำตัวนักเรียนซ้ำในระบบ กรุณาตรวจสอบข้อมูล";
      }
      
      toast({
        title: "เกิดข้อผิดพลาด! ❌",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const loadExistingStudents = async () => {
    try {
      const students = await getAllStudents();
      setExistingStudents(students);
    } catch (error) {
      console.error('Error loading existing students:', error);
    }
  };

  const handleDeleteAllStudents = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลนักเรียนทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return;
    }

    setIsProcessing(true);
    try {
      await deleteAllStudents();
      toast({
        title: "ลบข้อมูลสำเร็จ! 🗑️",
        description: "ลบข้อมูลนักเรียนทั้งหมดเรียบร้อยแล้ว",
        duration: 3000,
      });
      
      await loadExistingStudents();
    } catch (error) {
      console.error('Error deleting students:', error);
      toast({
        title: "เกิดข้อผิดพลาด! ❌",
        description: "ไม่สามารถลบข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    // Create sample data
    const sampleData = [
      { 'เลขประจำตัว': '12345', 'ชั้น': 'ม.1', 'ห้อง': '1', 'ชื่อ-สกุล': 'สมชาย ใจดี' },
      { 'เลขประจำตัว': '12346', 'ชั้น': 'ม.1', 'ห้อง': '1', 'ชื่อ-สกุล': 'สมหญิง สุขใส' },
      { 'เลขประจำตัว': '12347', 'ชั้น': 'ม.2', 'ห้อง': '2', 'ชื่อ-สกุล': 'วิชัย รุ่งเรือง' },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'รายชื่อนักเรียน');
    
    XLSX.writeFile(wb, 'ตัวอย่างรายชื่อนักเรียน.xlsx');
    
    toast({
      title: "ดาวน์โหลดไฟล์ตัวอย่าง 📥",
      description: "ดาวน์โหลดไฟล์ตัวอย่างเรียบร้อยแล้ว",
      duration: 3000,
    });
  };

  // Load existing students on component mount
  useState(() => {
    loadExistingStudents();
  });

  const validCount = previewData.filter(item => item.isValid).length;
  const invalidCount = previewData.length - validCount;

  return (
    <div className="p-4 pb-20 thai-content animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">นำเข้ารายชื่อนักเรียนจาก Excel</h1>
        <p className="text-gray-600">อัปโหลดไฟล์ Excel เพื่อเพิ่มข้อมูลนักเรียนจำนวนมากพร้อมกัน</p>
      </div>

      {/* Existing Students Summary */}
      {existingStudents.length > 0 && (
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-thai-blue-600" />
              ข้อมูลนักเรียนในระบบ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-thai-blue-600">{existingStudents.length.toLocaleString()}</p>
                <p className="text-sm text-gray-600">นักเรียนทั้งหมดในระบบ</p>
              </div>
              <Button 
                onClick={handleDeleteAllStudents}
                disabled={isProcessing}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                ลบข้อมูลทั้งหมด
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Download */}
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Download className="w-5 h-5 text-thai-blue-600" />
            ไฟล์ตัวอย่าง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            ดาวน์โหลดไฟล์ตัวอย่างเพื่อดูรูปแบบการกรอกข้อมูลที่ถูกต้อง
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="font-medium text-gray-800 mb-2">รูปแบบคอลัมน์ที่ต้องการ:</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>• เลขประจำตัว</div>
              <div>• ชั้น (เช่น ม.1, ม.2)</div>
              <div>• ห้อง (เช่น 1, 2, 3)</div>
              <div>• ชื่อ-สกุล</div>
            </div>
          </div>
          <Button 
            onClick={downloadTemplate}
            variant="outline" 
            className="w-full border-thai-blue-600 text-thai-blue-600 hover:bg-thai-blue-50"
          >
            <Download className="w-4 h-4 mr-2" />
            ดาวน์โหลดไฟล์ตัวอย่าง
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Upload className="w-5 h-5 text-thai-green-600" />
            อัปโหลดไฟล์ Excel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                คลิกเพื่อเลือกไฟล์ Excel
              </p>
              <p className="text-sm text-gray-500">
                รองรับไฟล์ .xlsx และ .xls เท่านั้น
              </p>
            </label>
          </div>
          
          {fileName && (
            <div className="mt-4 p-3 bg-thai-blue-50 rounded-lg">
              <p className="text-sm text-thai-blue-800">
                <FileSpreadsheet className="w-4 h-4 inline mr-2" />
                ไฟล์ที่เลือก: {fileName}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Data */}
      {previewData.length > 0 && (
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-thai-green-600" />
              ตรวจสอบข้อมูลก่อนนำเข้า
            </CardTitle>
            <div className="flex gap-4 text-sm">
              <span className="text-thai-green-600 font-medium">ถูกต้อง: {validCount} รายการ</span>
              {invalidCount > 0 && (
                <span className="text-red-600 font-medium">ผิดพลาด: {invalidCount} รายการ</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {previewData.map((student, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    student.isValid 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {student.isValid ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium text-gray-800">
                          {student.fullName || 'ไม่มีชื่อ'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>เลขประจำตัว: {student.studentNumber || '-'}</div>
                        <div>ห้องเรียน: {student.classroom || '-'}</div>
                      </div>
                      
                      {!student.isValid && student.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-red-600 font-medium">ข้อผิดพลาด:</p>
                          <ul className="text-sm text-red-600 list-disc list-inside">
                            {student.errors.map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={handleConfirmImport}
                disabled={isProcessing || validCount === 0}
                className="w-full bg-thai-green-600 hover:bg-thai-green-700 text-white py-3 text-lg rounded-xl"
              >
                <Upload className="w-5 h-5 mr-2" />
                {isProcessing ? 'กำลังนำเข้าข้อมูล...' : `ยืนยันเพิ่มข้อมูล (${validCount} รายการ)`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thai-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-800 font-medium">กำลังประมวลผล...</p>
              <p className="text-sm text-gray-600 mt-1">กรุณารอสักครู่</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
