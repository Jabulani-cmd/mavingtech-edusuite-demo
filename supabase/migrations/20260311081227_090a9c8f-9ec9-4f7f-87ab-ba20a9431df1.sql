
-- Allow teachers to delete their own announcements
DROP POLICY IF EXISTS "Admin roles can delete announcements" ON public.announcements;
CREATE POLICY "Authors and admins can delete announcements" ON public.announcements
  FOR DELETE TO authenticated
  USING (
    author_id = auth.uid() OR
    public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[])
  );
