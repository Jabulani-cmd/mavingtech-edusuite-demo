
-- 1. Fix study_materials DELETE policy to include teachers
DROP POLICY IF EXISTS "Admin can delete study_materials" ON public.study_materials;
CREATE POLICY "Teachers can delete study_materials" ON public.study_materials
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));

-- 2. Add missing columns to announcements
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS target_type TEXT DEFAULT 'whole_school';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS target_ids TEXT[];
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS file_attachments TEXT[];
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 3. Add boarding_status to students
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS boarding_status TEXT DEFAULT 'day';
