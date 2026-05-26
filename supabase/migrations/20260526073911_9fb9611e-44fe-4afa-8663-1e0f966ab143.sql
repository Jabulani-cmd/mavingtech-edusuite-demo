
CREATE POLICY sub_student_via_link_select ON public.subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_students ps
      JOIN public.students st ON st.id = ps.student_id
      WHERE st.user_id = auth.uid()
        AND ps.parent_id = subscriptions.parent_id
    )
  );

CREATE POLICY grants_student_via_link_select ON public.access_grants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_students ps
      JOIN public.students st ON st.id = ps.student_id
      WHERE st.user_id = auth.uid()
        AND ps.parent_id = access_grants.parent_id
    )
  );
