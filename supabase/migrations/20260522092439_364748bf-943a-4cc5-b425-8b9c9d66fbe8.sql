-- Demo mode: allow public access to timetable tables (no real auth in app)
DROP POLICY IF EXISTS "tt_def_select"   ON public.tt_definitions;
DROP POLICY IF EXISTS "tt_def_insert"   ON public.tt_definitions;
DROP POLICY IF EXISTS "tt_def_update"   ON public.tt_definitions;
DROP POLICY IF EXISTS "tt_def_delete"   ON public.tt_definitions;
DROP POLICY IF EXISTS "tt_slots_select" ON public.tt_slots;
DROP POLICY IF EXISTS "tt_slots_all"    ON public.tt_slots;
DROP POLICY IF EXISTS "tt_exam_select"  ON public.tt_exam_slots;
DROP POLICY IF EXISTS "tt_exam_all"     ON public.tt_exam_slots;
DROP POLICY IF EXISTS "tt_conf_select"  ON public.tt_conflicts;
DROP POLICY IF EXISTS "tt_conf_all"     ON public.tt_conflicts;
DROP POLICY IF EXISTS "ai_tt_select"    ON public.ai_timetable_logs;
DROP POLICY IF EXISTS "ai_tt_insert"    ON public.ai_timetable_logs;

CREATE POLICY "tt_def_public"  ON public.tt_definitions    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tt_slots_public" ON public.tt_slots         FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tt_exam_public" ON public.tt_exam_slots     FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tt_conf_public" ON public.tt_conflicts      FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ai_tt_public"   ON public.ai_timetable_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);