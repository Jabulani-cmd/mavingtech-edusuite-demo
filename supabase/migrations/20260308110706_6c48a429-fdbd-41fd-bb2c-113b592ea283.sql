
-- Assessments table
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  class_id UUID REFERENCES public.classes(id),
  subject_id UUID REFERENCES public.subjects(id),
  title TEXT NOT NULL,
  assessment_type TEXT NOT NULL DEFAULT 'test',
  max_marks DECIMAL(5,2) DEFAULT 100,
  due_date DATE,
  instructions TEXT,
  file_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage own assessments" ON public.assessments FOR ALL TO authenticated
  USING (teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students read published assessments" ON public.assessments FOR SELECT TO authenticated
  USING (is_published = true);

-- Assessment submissions
CREATE TABLE public.assessment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id),
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_url TEXT,
  comments TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage submissions" ON public.assessment_submissions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students manage own submissions" ON public.assessment_submissions FOR ALL TO authenticated
  USING (student_id IN (SELECT s.id FROM students s WHERE s.user_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT s.id FROM students s WHERE s.user_id = auth.uid()));

-- Assessment results
CREATE TABLE public.assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id),
  marks_obtained DECIMAL(5,2) DEFAULT 0,
  percentage DECIMAL(5,2),
  grade TEXT,
  teacher_feedback TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  graded_by UUID,
  graded_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage results" ON public.assessment_results FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students view published results" ON public.assessment_results FOR SELECT TO authenticated
  USING (is_published = true AND student_id IN (SELECT s.id FROM students s WHERE s.user_id = auth.uid()));

-- Add enhanced columns to study_materials
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add enhanced columns to announcements
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS target_type TEXT DEFAULT 'whole_school';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS target_ids TEXT[];
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS file_attachments TEXT[];
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
