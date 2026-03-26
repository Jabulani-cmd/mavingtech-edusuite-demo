-- Drop existing restrictive policies on announcements
DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Anyone read public announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authenticated read all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers read own announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers insert announcements" ON public.announcements;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admins manage announcements"
ON public.announcements FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone read public announcements"
ON public.announcements FOR SELECT
TO public
USING (is_public = true);

CREATE POLICY "Teachers insert announcements"
ON public.announcements FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers read own announcements"
ON public.announcements FOR SELECT
TO authenticated
USING (author_id = auth.uid());