CREATE OR REPLACE FUNCTION public.has_school_role(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT _uid IS NOT NULL AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid) $$;

DROP POLICY IF EXISTS study_materials_auth_read ON public.study_materials;
CREATE POLICY study_materials_scoped_read ON public.study_materials FOR SELECT TO authenticated
USING (public.is_school_staff(auth.uid()) OR (coalesce(is_published, true) AND (class_id IS NULL OR public.in_class(auth.uid(), class_id))));

DROP POLICY IF EXISTS homework_auth_read ON public.homework;
CREATE POLICY homework_scoped_read ON public.homework FOR SELECT TO authenticated
USING (public.is_school_staff(auth.uid()) OR public.in_class(auth.uid(), class_id));

DROP POLICY IF EXISTS lm_read ON public.learning_materials;
CREATE POLICY lm_scoped_read ON public.learning_materials FOR SELECT TO authenticated
USING (public.is_school_staff(auth.uid()) OR (class_id IS NULL AND public.has_school_role(auth.uid())) OR public.in_class(auth.uid(), class_id));

DROP POLICY IF EXISTS exam_timetable_entries_auth_read ON public.exam_timetable_entries;
CREATE POLICY exam_timetable_entries_scoped_read ON public.exam_timetable_entries FOR SELECT TO authenticated
USING (public.is_school_staff(auth.uid()) OR (class_id IS NULL AND public.has_school_role(auth.uid())) OR public.in_class(auth.uid(), class_id));

DROP POLICY IF EXISTS timetable_entries_auth_read ON public.timetable_entries;
CREATE POLICY timetable_entries_scoped_read ON public.timetable_entries FOR SELECT TO authenticated
USING (public.is_school_staff(auth.uid()) OR public.in_class(auth.uid(), class_id));

DROP POLICY IF EXISTS sports_schedule_auth_read ON public.sports_schedule;
DROP POLICY IF EXISTS sports_schedule_public_read ON public.sports_schedule;
CREATE POLICY sports_schedule_school_fixtures_read ON public.sports_schedule FOR SELECT TO anon, authenticated
USING (class_id IS NULL);
CREATE POLICY sports_schedule_class_read ON public.sports_schedule FOR SELECT TO authenticated
USING (public.is_school_staff(auth.uid()) OR public.in_class(auth.uid(), class_id));

DROP POLICY IF EXISTS meetings_auth_read ON public.meetings;
DROP POLICY IF EXISTS meetings_public_read ON public.meetings;
CREATE POLICY meetings_public_types_read ON public.meetings FOR SELECT TO anon, authenticated
USING (meeting_type IN ('sdc', 'parent-teacher'));
CREATE POLICY meetings_members_read ON public.meetings FOR SELECT TO authenticated
USING (public.has_school_role(auth.uid()));

DROP POLICY IF EXISTS subjects_auth_read ON public.subjects;
CREATE POLICY subjects_members_read ON public.subjects FOR SELECT TO authenticated
USING (public.has_school_role(auth.uid()));

DROP POLICY IF EXISTS rooms_auth_read ON public.rooms;
CREATE POLICY rooms_members_read ON public.rooms FOR SELECT TO authenticated
USING (public.has_school_role(auth.uid()));

DROP POLICY IF EXISTS ai_timetable_logs_read_all ON public.ai_timetable_logs;
DROP POLICY IF EXISTS tt_conflicts_read_all ON public.tt_conflicts;
DROP POLICY IF EXISTS tt_definitions_read_all ON public.tt_definitions;
DROP POLICY IF EXISTS tt_exam_slots_read_all ON public.tt_exam_slots;
DROP POLICY IF EXISTS tt_slots_read_all ON public.tt_slots;
CREATE POLICY tt_slots_members_read ON public.tt_slots FOR SELECT TO authenticated USING (public.has_school_role(auth.uid()));
CREATE POLICY tt_exam_slots_members_read ON public.tt_exam_slots FOR SELECT TO authenticated USING (public.has_school_role(auth.uid()));
CREATE POLICY tt_definitions_members_read ON public.tt_definitions FOR SELECT TO authenticated USING (public.has_school_role(auth.uid()));

DROP POLICY IF EXISTS school_media_upload ON storage.objects;
CREATE POLICY school_media_upload ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'school-media' AND (
  public.is_school_staff(auth.uid())
  OR ((storage.foldername(name))[1] = 'receipts' AND owner_id = (select auth.uid()::text))
  OR ((storage.foldername(name))[1] = 'submissions' AND owner_id = (select auth.uid()::text)
      AND EXISTS (SELECT 1 FROM public.students s WHERE s.id::text = (storage.foldername(name))[2] AND s.user_id = auth.uid()))
));