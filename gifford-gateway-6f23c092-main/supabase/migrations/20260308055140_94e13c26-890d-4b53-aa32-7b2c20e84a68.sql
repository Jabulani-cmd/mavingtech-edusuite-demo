
-- Extend classes table
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS form_level text DEFAULT 'Form 1',
  ADD COLUMN IF NOT EXISTS stream text,
  ADD COLUMN IF NOT EXISTS class_teacher_id uuid REFERENCES public.staff(id),
  ADD COLUMN IF NOT EXISTS room text,
  ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 40;

-- Extend subjects table
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS code text,
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS form_levels text[] DEFAULT '{"Form 1","Form 2","Form 3","Form 4","Lower 6","Upper 6"}',
  ADD COLUMN IF NOT EXISTS is_examinable boolean DEFAULT true;

-- Class-subject assignment with teacher
CREATE TABLE IF NOT EXISTS public.class_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES public.staff(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(class_id, subject_id)
);

-- Better timetable entries (keep old timetable table, add new one)
CREATE TABLE IF NOT EXISTS public.timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id),
  teacher_id uuid REFERENCES public.staff(id),
  day_of_week integer NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  room text,
  academic_year text DEFAULT '2026',
  term text DEFAULT 'Term 1',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id),
  attendance_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'present',
  recorded_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, attendance_date)
);

-- Exams
CREATE TABLE IF NOT EXISTS public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  exam_type text NOT NULL DEFAULT 'end_of_term',
  form_level text NOT NULL,
  term text NOT NULL DEFAULT 'Term 1',
  academic_year text NOT NULL DEFAULT '2026',
  start_date date,
  end_date date,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Exam results
CREATE TABLE IF NOT EXISTS public.exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id),
  mark numeric(5,2) NOT NULL DEFAULT 0,
  grade text,
  teacher_comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(exam_id, student_id, subject_id)
);

-- RLS
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- class_subjects
CREATE POLICY "Admins manage class_subjects" ON public.class_subjects FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated read class_subjects" ON public.class_subjects FOR SELECT TO authenticated USING (true);

-- timetable_entries
CREATE POLICY "Admins manage timetable_entries" ON public.timetable_entries FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated read timetable_entries" ON public.timetable_entries FOR SELECT TO authenticated USING (true);

-- attendance
CREATE POLICY "Admins manage attendance" ON public.attendance FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Teachers manage attendance" ON public.attendance FOR ALL TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT TO authenticated USING (student_id IN (SELECT s.id FROM public.students s WHERE s.user_id = auth.uid()));

-- exams
CREATE POLICY "Admins manage exams" ON public.exams FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Teachers manage exams" ON public.exams FOR ALL TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Authenticated read published exams" ON public.exams FOR SELECT TO authenticated USING (is_published = true);

-- exam_results
CREATE POLICY "Admins manage exam_results" ON public.exam_results FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Teachers manage exam_results" ON public.exam_results FOR ALL TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Students view own exam_results" ON public.exam_results FOR SELECT TO authenticated USING (student_id IN (SELECT s.id FROM public.students s WHERE s.user_id = auth.uid()));
