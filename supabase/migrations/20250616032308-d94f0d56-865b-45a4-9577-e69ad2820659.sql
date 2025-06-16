
-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_number TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  classroom TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Add Row Level Security (RLS) - Making tables publicly accessible for this school system
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies that allow public access (suitable for internal school system)
CREATE POLICY "Allow public access to students" 
  ON public.students 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow public access to attendance_records" 
  ON public.attendance_records 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_students_student_number ON public.students(student_number);
CREATE INDEX idx_students_classroom ON public.students(classroom);
CREATE INDEX idx_attendance_records_student_id ON public.attendance_records(student_id);
CREATE INDEX idx_attendance_records_date ON public.attendance_records(date);
