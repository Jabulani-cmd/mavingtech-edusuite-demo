CREATE OR REPLACE FUNCTION public.learner_takes_subject(_student_id uuid, _subject_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS (SELECT 1 FROM public.students st JOIN public.subjects sb ON sb.id=_subject_id
 WHERE st.id=_student_id AND CASE
 WHEN nullif(btrim(st.subject_combination),'') IS NOT NULL THEN EXISTS
 (SELECT 1 FROM unnest(string_to_array(st.subject_combination,',')) n WHERE lower(btrim(n))=lower(sb.name))
 ELSE EXISTS (SELECT 1 FROM public.student_classes sc JOIN public.class_subjects cs ON cs.class_id=sc.class_id WHERE sc.student_id=st.id AND cs.subject_id=sb.id) END);
$$;
REVOKE ALL ON FUNCTION public.learner_takes_subject(uuid,uuid) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.validate_new_learner_subject_work()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE sid uuid;
BEGIN
 IF TG_TABLE_NAME IN ('marks','exam_results') THEN
  sid:=NEW.subject_id;
  IF TG_OP='UPDATE' THEN IF NEW.student_id IS NOT DISTINCT FROM OLD.student_id AND NEW.subject_id IS NOT DISTINCT FROM OLD.subject_id THEN RETURN NEW; END IF; END IF;
 ELSE
  SELECT subject_id INTO sid FROM public.assessments WHERE id=NEW.assessment_id;
  IF TG_OP='UPDATE' THEN IF NEW.student_id IS NOT DISTINCT FROM OLD.student_id AND NEW.assessment_id IS NOT DISTINCT FROM OLD.assessment_id THEN RETURN NEW; END IF; END IF;
 END IF;
 IF sid IS NOT NULL AND NOT public.learner_takes_subject(NEW.student_id,sid) THEN
  RAISE EXCEPTION 'This subject is not in the learner''s current subject selection' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.validate_new_learner_subject_work() FROM PUBLIC;
CREATE TRIGGER validate_mark_subject BEFORE INSERT OR UPDATE OF student_id,subject_id ON public.marks FOR EACH ROW EXECUTE FUNCTION public.validate_new_learner_subject_work();
CREATE TRIGGER validate_exam_result_subject BEFORE INSERT OR UPDATE OF student_id,subject_id ON public.exam_results FOR EACH ROW EXECUTE FUNCTION public.validate_new_learner_subject_work();
CREATE TRIGGER validate_assessment_result_subject BEFORE INSERT OR UPDATE OF student_id,assessment_id ON public.assessment_results FOR EACH ROW EXECUTE FUNCTION public.validate_new_learner_subject_work();
CREATE TRIGGER validate_submission_subject BEFORE INSERT OR UPDATE OF student_id,assessment_id ON public.assessment_submissions FOR EACH ROW EXECUTE FUNCTION public.validate_new_learner_subject_work();
CREATE OR REPLACE FUNCTION public.sync_term_subject_selection()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE learner_form text; n integer; minimum integer; maximum integer;
BEGIN
 IF TG_OP='UPDATE' THEN IF NEW.subjects IS NOT DISTINCT FROM OLD.subjects AND NEW.student_id IS NOT DISTINCT FROM OLD.student_id THEN RETURN NEW; END IF; END IF;
 SELECT form INTO learner_form FROM public.students WHERE id=NEW.student_id;
 SELECT count(DISTINCT lower(btrim(s))) INTO n FROM unnest(NEW.subjects) s WHERE btrim(s)<>'';
 minimum:=CASE WHEN learner_form IN ('Form 5','Form 6') THEN 1 ELSE 7 END;
 maximum:=CASE WHEN learner_form IN ('Form 5','Form 6') THEN 4 ELSE 10 END;
 IF n<minimum OR n>maximum THEN RAISE EXCEPTION '% requires % to % subjects',learner_form,minimum,maximum USING ERRCODE='23514'; END IF;
 UPDATE public.students SET subject_combination=array_to_string(NEW.subjects,', ') WHERE id=NEW.student_id AND subject_combination IS DISTINCT FROM array_to_string(NEW.subjects,', ');
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.sync_term_subject_selection() FROM PUBLIC;
CREATE TRIGGER sync_term_subject_selection BEFORE INSERT OR UPDATE OF subjects,student_id ON public.term_registrations FOR EACH ROW EXECUTE FUNCTION public.sync_term_subject_selection();