CREATE POLICY term_reports_teacher_insert ON public.term_reports FOR INSERT TO authenticated
  WITH CHECK (is_published = false AND public.can_teach_student(auth.uid(), student_id));
CREATE POLICY term_reports_teacher_update ON public.term_reports FOR UPDATE TO authenticated
  USING (is_published = false AND public.can_teach_student(auth.uid(), student_id))
  WITH CHECK (is_published = false AND public.can_teach_student(auth.uid(), student_id));
CREATE POLICY term_reports_teacher_delete ON public.term_reports FOR DELETE TO authenticated
  USING (is_published = false AND public.can_teach_student(auth.uid(), student_id));