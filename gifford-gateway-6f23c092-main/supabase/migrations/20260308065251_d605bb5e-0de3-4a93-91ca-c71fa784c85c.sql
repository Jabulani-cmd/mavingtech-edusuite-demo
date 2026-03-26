CREATE POLICY "Teachers insert announcements"
ON public.announcements
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers read own announcements"
ON public.announcements
FOR SELECT
TO authenticated
USING (author_id = auth.uid());