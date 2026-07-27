
CREATE OR REPLACE FUNCTION public.notify_on_assessment_result()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_user uuid;
  v_student_name text;
  v_assessment_title text;
  v_max numeric;
  v_msg text;
  r RECORD;
BEGIN
  SELECT user_id, full_name INTO v_student_user, v_student_name
  FROM public.students WHERE id = NEW.student_id;

  SELECT title, COALESCE(max_marks, total_marks) INTO v_assessment_title, v_max
  FROM public.assessments WHERE id = NEW.assessment_id;

  v_msg := COALESCE(v_assessment_title, 'Assessment') ||
           ': ' || COALESCE(NEW.mark::text, '—') ||
           CASE WHEN v_max IS NOT NULL AND v_max > 0 THEN ' / ' || v_max::text ELSE '' END;

  IF v_student_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (v_student_user, 'New assessment result', v_msg, 'result', '/portal/student');
  END IF;

  FOR r IN
    SELECT DISTINCT parent_id FROM public.parent_students WHERE student_id = NEW.student_id
    UNION
    SELECT DISTINCT parent_id FROM public.parent_student_links WHERE student_id = NEW.student_id
  LOOP
    IF r.parent_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (r.parent_id,
              'New result for ' || COALESCE(v_student_name, 'your child'),
              v_msg, 'result', '/portal/parent');
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_assessment_result ON public.assessment_results;
CREATE TRIGGER trg_notify_on_assessment_result
AFTER INSERT ON public.assessment_results
FOR EACH ROW EXECUTE FUNCTION public.notify_on_assessment_result();
