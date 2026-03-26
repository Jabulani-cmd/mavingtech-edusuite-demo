
-- Enable RLS on all critical tables
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_timetables ENABLE ROW LEVEL SECURITY;

-- Ensure teachers can insert notifications (for automated ones after material upload etc)
DROP POLICY IF EXISTS "Admins and teachers insert notifications" ON public.notifications;
CREATE POLICY "Staff insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role)
  OR has_role(auth.uid(), 'hod'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'admin_supervisor'::app_role)
  OR has_role(auth.uid(), 'principal'::app_role)
  OR has_role(auth.uid(), 'deputy_principal'::app_role)
);

-- Ensure teachers can read all timetable_entries (already exists but re-confirm)
DROP POLICY IF EXISTS "Authenticated read timetable_entries" ON public.timetable_entries;
CREATE POLICY "Authenticated read timetable_entries"
ON public.timetable_entries FOR SELECT TO authenticated
USING (true);

-- Admin supervisor manage timetable_entries
DROP POLICY IF EXISTS "Admin supervisor manage timetable_entries" ON public.timetable_entries;
CREATE POLICY "Admin supervisor manage timetable_entries"
ON public.timetable_entries FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin_supervisor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));

-- Ensure all authenticated can read timetable
DROP POLICY IF EXISTS "Authenticated read timetable" ON public.timetable;
CREATE POLICY "Authenticated read timetable"
ON public.timetable FOR SELECT TO authenticated
USING (true);

-- Allow HODs to manage marks, attendance, assessments
DROP POLICY IF EXISTS "HOD manage marks" ON public.marks;
CREATE POLICY "HOD manage marks" ON public.marks FOR ALL TO authenticated
USING (has_role(auth.uid(), 'hod'::app_role))
WITH CHECK (has_role(auth.uid(), 'hod'::app_role));

DROP POLICY IF EXISTS "HOD manage attendance" ON public.attendance;
CREATE POLICY "HOD manage attendance" ON public.attendance FOR ALL TO authenticated
USING (has_role(auth.uid(), 'hod'::app_role))
WITH CHECK (has_role(auth.uid(), 'hod'::app_role));

DROP POLICY IF EXISTS "Deputy principal manage marks" ON public.marks;
CREATE POLICY "Deputy principal manage marks" ON public.marks FOR ALL TO authenticated
USING (has_role(auth.uid(), 'deputy_principal'::app_role))
WITH CHECK (has_role(auth.uid(), 'deputy_principal'::app_role));

-- Ensure study_materials readable by all authenticated (students need to see materials)
DROP POLICY IF EXISTS "Authenticated read published materials" ON public.study_materials;
CREATE POLICY "Authenticated read published materials"
ON public.study_materials FOR SELECT TO authenticated
USING (is_published = true);

-- Ensure admin/admin_supervisor manage study_materials  
DROP POLICY IF EXISTS "Admin manage study_materials" ON public.study_materials;
CREATE POLICY "Admin manage study_materials"
ON public.study_materials FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin supervisor manage study_materials" ON public.study_materials;
CREATE POLICY "Admin supervisor manage study_materials"
ON public.study_materials FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin_supervisor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));

-- Ensure assessment_results has teacher insert policy
DROP POLICY IF EXISTS "Teachers manage results" ON public.assessment_results;
CREATE POLICY "Teachers manage results" ON public.assessment_results FOR ALL TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Ensure users can insert their own notifications (e.g. user_id = auth.uid())
DROP POLICY IF EXISTS "Users insert own notifications" ON public.notifications;
CREATE POLICY "Users insert own notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
