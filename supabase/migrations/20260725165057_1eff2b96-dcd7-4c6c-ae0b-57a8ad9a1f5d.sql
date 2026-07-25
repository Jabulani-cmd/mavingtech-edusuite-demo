
-- Auto-link students to their class roster on insert/update
CREATE OR REPLACE FUNCTION public.auto_link_student_class()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_grade text;
  v_stream text;
  v_class_id uuid;
BEGIN
  IF COALESCE(NEW.status, 'active') <> 'active' THEN
    RETURN NEW;
  END IF;

  v_grade := COALESCE(NULLIF(NEW.form, ''), NULLIF(NEW.class, ''));
  v_stream := NULLIF(NEW.stream, '');

  IF v_grade IS NULL THEN
    RETURN NEW;
  END IF;

  -- Match on class name first (e.g. "Grade 8A"), then level+stream, then level only
  IF NEW.class IS NOT NULL AND NEW.class <> '' THEN
    SELECT id INTO v_class_id FROM public.classes WHERE name = NEW.class LIMIT 1;
  END IF;

  IF v_class_id IS NULL AND v_stream IS NOT NULL THEN
    SELECT id INTO v_class_id FROM public.classes
     WHERE level = v_grade AND stream = v_stream LIMIT 1;
  END IF;

  IF v_class_id IS NULL THEN
    SELECT id INTO v_class_id FROM public.classes
     WHERE level = v_grade
     ORDER BY CASE WHEN stream = COALESCE(v_stream, 'A') THEN 0 ELSE 1 END, stream
     LIMIT 1;
  END IF;

  IF v_class_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.student_classes (student_id, class_id)
  VALUES (NEW.id, v_class_id)
  ON CONFLICT (student_id, class_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_link_student_class ON public.students;
CREATE TRIGGER trg_auto_link_student_class
  AFTER INSERT OR UPDATE OF form, class, stream, status
  ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_link_student_class();

-- Backfill any orphaned active students
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT s.id FROM public.students s
           LEFT JOIN public.student_classes sc ON sc.student_id = s.id
           WHERE sc.id IS NULL AND s.status = 'active'
  LOOP
    UPDATE public.students SET updated_at = now() WHERE id = r.id;
  END LOOP;
END $$;
