
-- Create assessments table
CREATE TABLE public.assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL,
  title text NOT NULL,
  assessment_type text DEFAULT 'test',
  class_id uuid REFERENCES public.classes(id),
  subject_id uuid REFERENCES public.subjects(id),
  max_marks numeric DEFAULT 100,
  due_date date,
  instructions text,
  file_url text,
  link_url text,
  is_published boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view assessments" ON public.assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can insert assessments" ON public.assessments FOR INSERT TO authenticated WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'admin_supervisor'::app_role, 'principal'::app_role, 'deputy_principal'::app_role, 'hod'::app_role, 'teacher'::app_role]));
CREATE POLICY "Teachers can update assessments" ON public.assessments FOR UPDATE TO authenticated USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'admin_supervisor'::app_role, 'principal'::app_role, 'deputy_principal'::app_role, 'hod'::app_role, 'teacher'::app_role]));
CREATE POLICY "Teachers can delete assessments" ON public.assessments FOR DELETE TO authenticated USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'admin_supervisor'::app_role, 'principal'::app_role, 'deputy_principal'::app_role, 'hod'::app_role, 'teacher'::app_role]));

-- Create assessment_submissions table
CREATE TABLE public.assessment_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  file_url text,
  comments text,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view submissions" ON public.assessment_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students can insert submissions" ON public.assessment_submissions FOR INSERT TO authenticated WITH CHECK (true);

-- Create assessment_results table
CREATE TABLE public.assessment_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  marks_obtained numeric,
  percentage numeric,
  grade text,
  teacher_feedback text,
  graded_by uuid,
  graded_date timestamp with time zone,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view results" ON public.assessment_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can insert results" ON public.assessment_results FOR INSERT TO authenticated WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'admin_supervisor'::app_role, 'principal'::app_role, 'deputy_principal'::app_role, 'hod'::app_role, 'teacher'::app_role]));
CREATE POLICY "Teachers can update results" ON public.assessment_results FOR UPDATE TO authenticated USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'admin_supervisor'::app_role, 'principal'::app_role, 'deputy_principal'::app_role, 'hod'::app_role, 'teacher'::app_role]));
