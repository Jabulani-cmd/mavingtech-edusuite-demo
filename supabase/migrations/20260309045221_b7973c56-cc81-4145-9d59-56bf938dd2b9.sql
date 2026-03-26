-- Create exam_timetable_entries table for exam schedules
CREATE TABLE public.exam_timetable_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue TEXT,
  invigilators TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exam_timetable_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins manage exam_timetable_entries" ON public.exam_timetable_entries
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Principal manage exam_timetable_entries" ON public.exam_timetable_entries
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'principal'::app_role));

CREATE POLICY "Teachers manage exam_timetable_entries" ON public.exam_timetable_entries
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Management read exam_timetable_entries" ON public.exam_timetable_entries
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'deputy_principal'::app_role) OR 
    has_role(auth.uid(), 'hod'::app_role)
  );

CREATE POLICY "Students read published exam_timetable" ON public.exam_timetable_entries
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND e.is_published = true)
  );

CREATE POLICY "Parents read published exam_timetable" ON public.exam_timetable_entries
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'parent'::app_role) AND
    EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND e.is_published = true)
  );

-- Create term_reports table for comprehensive reports
CREATE TABLE public.term_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  form_level TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id),
  -- Aggregated data stored as JSON
  assessment_data JSONB DEFAULT '[]'::jsonb,
  exam_data JSONB DEFAULT '[]'::jsonb,
  -- Summary
  total_marks NUMERIC DEFAULT 0,
  average_mark NUMERIC DEFAULT 0,
  overall_grade TEXT,
  class_rank INTEGER,
  class_size INTEGER,
  form_rank INTEGER,
  form_size INTEGER,
  -- Comments
  class_teacher_comment TEXT,
  head_comment TEXT,
  -- Meta
  is_published BOOLEAN DEFAULT false,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  generated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.term_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins manage term_reports" ON public.term_reports
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Principal manage term_reports" ON public.term_reports
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'principal'::app_role));

CREATE POLICY "Teachers manage term_reports" ON public.term_reports
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Students read own published reports" ON public.term_reports
  FOR SELECT TO authenticated USING (
    is_published = true AND
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents read child published reports" ON public.term_reports
  FOR SELECT TO authenticated USING (
    is_published = true AND
    student_id IN (SELECT ps.student_id FROM public.parent_students ps WHERE ps.parent_id = auth.uid())
  );