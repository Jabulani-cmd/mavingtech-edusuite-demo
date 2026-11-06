-- ============================================
-- ONLY SCHOOL LEADERS DECIDE WHO TEACHES WHICH CLASS
-- The teacher-scope rules (a teacher can record marks, results and attendance only for
-- classes they teach) depend on three tables: class_subjects (who teaches which subject in a
-- class), student_classes (who is in a class) and classes.class_teacher_id. Teachers could still
-- write to class_subjects and student_classes, so a teacher could assign themselves to any class,
-- or move a learner into one of their classes, and so get access to that learner's marks.
--
-- * Writing to class_subjects and student_classes is now limited to administrators, school
--   leaders and (for student_classes) the registration office. Teachers keep read access.
-- * The older "any teacher" write rules on marks, exam results, assessment results and
--   attendance are dropped, so the class-scoped rules from the teacher-scope migration are
--   the only teacher write rules. Leaders keep their own full-access rules.
-- Idempotent: safe to run more than once.
-- ============================================

-- ---------- class_subjects ----------
DROP POLICY IF EXISTS "Academic roles can manage class_subjects" ON public.class_subjects;
DROP POLICY IF EXISTS "Authenticated can manage class_subjects" ON public.class_subjects;
DROP POLICY IF EXISTS class_subjects_leaders_write ON public.class_subjects;
CREATE POLICY class_subjects_leaders_write ON public.class_subjects FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]));

-- ---------- student_classes ----------
DROP POLICY IF EXISTS "Academic roles can manage student_classes" ON public.student_classes;
DROP POLICY IF EXISTS "Authenticated can manage student_classes" ON public.student_classes;
DROP POLICY IF EXISTS student_classes_leaders_write ON public.student_classes;
CREATE POLICY student_classes_leaders_write ON public.student_classes FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','registration']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','registration']::app_role[]));

-- ---------- Older "any teacher" write rules that would bypass the class scope ----------
DROP POLICY IF EXISTS "Teachers manage marks" ON public.marks;
DROP POLICY IF EXISTS "Teachers can insert marks" ON public.marks;
DROP POLICY IF EXISTS "Teachers can update marks" ON public.marks;

DROP POLICY IF EXISTS "Teachers manage exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Teachers can insert exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Teachers can update exam_results" ON public.exam_results;

DROP POLICY IF EXISTS "Teachers manage results" ON public.assessment_results;
DROP POLICY IF EXISTS "Teachers can insert results" ON public.assessment_results;
DROP POLICY IF EXISTS "Teachers can update results" ON public.assessment_results;

DROP POLICY IF EXISTS "Teachers manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers can update attendance" ON public.attendance;

-- ---------- Leaders keep full write access on these tables ----------
-- (the dropped rules were also how some leaders, e.g. the deputy principal, wrote exam results and attendance)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['marks', 'exam_results', 'assessment_results', 'attendance'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_leaders_write', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
         USING (public.has_any_role(auth.uid(), ARRAY[''admin'',''admin_supervisor'',''principal'',''deputy_principal'',''hod'']::app_role[]))
         WITH CHECK (public.has_any_role(auth.uid(), ARRAY[''admin'',''admin_supervisor'',''principal'',''deputy_principal'',''hod'']::app_role[]))',
      t || '_leaders_write', t);
  END LOOP;
END $$;