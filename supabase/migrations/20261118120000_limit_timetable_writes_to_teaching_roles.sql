-- Timetable tables could be changed by any non-student, non-parent account (finance, registration, etc.).
-- Limit writes to the roles the /portal/timetables page is built for. Reads are unchanged.
-- Idempotent: every policy is dropped before it is created.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['tt_definitions', 'tt_slots', 'tt_conflicts', 'tt_exam_slots', 'ai_timetable_logs'] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_staff_write', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_teaching_write', t);
    EXECUTE format($p$CREATE POLICY %I ON public.%I FOR ALL TO authenticated
      USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','supervisor','principal','deputy_principal','hod','teacher']::app_role[]))
      WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','supervisor','principal','deputy_principal','hod','teacher']::app_role[]))$p$,
      t || '_teaching_write', t);
  END LOOP;
END $$;
