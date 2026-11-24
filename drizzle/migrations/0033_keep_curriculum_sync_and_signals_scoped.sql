CREATE OR REPLACE FUNCTION public.demo_class_takes_subject(_class_id uuid,_subject_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT CASE WHEN public.demo_class_subject_names(c.name) IS NOT NULL AND EXISTS
 (SELECT 1 FROM public.student_classes sc JOIN public.students st ON st.id=sc.student_id WHERE sc.class_id=c.id AND lower(st.email) LIKE '%@student.schooldemo.com')
 THEN EXISTS (SELECT 1 FROM public.subjects sb WHERE sb.id=_subject_id AND sb.name=ANY(public.demo_class_subject_names(c.name))) ELSE true END
 FROM public.classes c WHERE c.id=_class_id;
$$;
REVOKE ALL ON FUNCTION public.demo_class_takes_subject(uuid,uuid) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.guard_demo_class_subject()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.demo_class_takes_subject(NEW.class_id,NEW.subject_id) THEN
  RAISE EXCEPTION 'Choose a subject from this demo class''s curriculum' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION public.guard_demo_class_work()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_OP='UPDATE' THEN IF NEW.class_id IS NOT DISTINCT FROM OLD.class_id AND NEW.subject_id IS NOT DISTINCT FROM OLD.subject_id THEN RETURN NEW; END IF; END IF;
 IF NEW.class_id IS NOT NULL AND NEW.subject_id IS NOT NULL AND NOT public.demo_class_takes_subject(NEW.class_id,NEW.subject_id) THEN
  IF TG_TABLE_NAME='timetable_entries' AND EXISTS (SELECT 1 FROM public.subjects sb WHERE sb.id=NEW.subject_id AND lower(sb.name) IN ('study hall','private study','physical education')) THEN RETURN NEW; END IF;
  RAISE EXCEPTION 'Choose a subject from this demo class''s curriculum' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_demo_class_work() FROM PUBLIC;
CREATE TRIGGER guard_demo_assessment_subject BEFORE INSERT OR UPDATE OF class_id,subject_id ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.guard_demo_class_work();
CREATE TRIGGER guard_demo_material_subject BEFORE INSERT OR UPDATE OF class_id,subject_id ON public.study_materials FOR EACH ROW EXECUTE FUNCTION public.guard_demo_class_work();
CREATE TRIGGER guard_demo_lesson_subject BEFORE INSERT OR UPDATE OF class_id,subject_id ON public.lesson_plans FOR EACH ROW EXECUTE FUNCTION public.guard_demo_class_work();
CREATE TRIGGER guard_demo_timetable_subject BEFORE INSERT OR UPDATE OF class_id,subject_id ON public.timetable_entries FOR EACH ROW EXECUTE FUNCTION public.guard_demo_class_work();
DO $fix$
DECLARE definition text; adjusted text;
BEGIN
 SELECT pg_get_functiondef('public.sync_school_links()'::regprocedure) INTO definition;
 adjusted:=replace(definition,'WHERE te.subject_id IS NOT NULL AND te.teacher_id IS NOT NULL','WHERE te.subject_id IS NOT NULL AND te.teacher_id IS NOT NULL AND public.demo_class_takes_subject(te.class_id,te.subject_id)');
 adjusted:=replace(adjusted,'AND NOT EXISTS (SELECT 1 FROM class_subjects cs WHERE cs.class_id = c.id AND cs.subject_id = sub.id)','AND public.demo_class_takes_subject(c.id,sub.id) AND NOT EXISTS (SELECT 1 FROM class_subjects cs WHERE cs.class_id = c.id AND cs.subject_id = sub.id)');
 IF adjusted=definition THEN RAISE EXCEPTION 'Synchronization definition changed; review before adjusting'; END IF;
 EXECUTE adjusted;
 SELECT pg_get_functiondef('public.agent_student_signals(integer,integer)'::regprocedure) INTO definition;
 adjusted:=replace(definition,'WHERE sc.d >= p.term_from','WHERE sc.d >= p.term_from AND public.learner_takes_subject(sc.student_id,sc.subject_id)');
 adjusted:=replace(adjusted,'WHERE a.due_date >= p.term_from AND a.due_date < current_date','WHERE a.due_date >= p.term_from AND a.due_date < current_date AND (a.subject_id IS NULL OR public.learner_takes_subject(l.student_id,a.subject_id))');
 IF adjusted=definition THEN RAISE EXCEPTION 'Monitoring definition changed; review before adjusting'; END IF;
 EXECUTE adjusted;
 SELECT pg_get_functiondef('public.validate_student_subject_load()'::regprocedure) INTO definition;
 adjusted:=replace(definition,'SELECT count(DISTINCT lower(btrim(s))) INTO n','IF EXISTS (SELECT 1 FROM unnest(string_to_array(NEW.subject_combination,'','')) s WHERE lower(btrim(s)) IN (''study hall'',''private study'')) THEN RAISE EXCEPTION ''Supervised study is a timetable activity, not an enrolled subject'' USING ERRCODE=''23514''; END IF; SELECT count(DISTINCT lower(btrim(s))) INTO n');
 IF adjusted=definition THEN RAISE EXCEPTION 'Student validation definition changed; review before adjusting'; END IF;
 EXECUTE adjusted;
END $fix$;