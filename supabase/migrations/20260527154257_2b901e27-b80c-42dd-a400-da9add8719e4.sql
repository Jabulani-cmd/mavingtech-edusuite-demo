CREATE POLICY "profiles_read_linked_family" ON public.profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.parent_students ps
    LEFT JOIN public.students s ON s.id = ps.student_id
    WHERE
      -- viewer is the parent, target profile is the linked student
      (ps.parent_id = auth.uid() AND (public.profiles.user_id = ps.student_id OR public.profiles.user_id = s.user_id))
      OR
      -- viewer is the student, target profile is the linked parent
      ((ps.student_id = auth.uid() OR s.user_id = auth.uid()) AND public.profiles.user_id = ps.parent_id)
  )
);