
-- 1. Trigger: When exam results are published (exam is_published = true), notify all students with results
CREATE OR REPLACE FUNCTION public.notify_exam_results_published()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_published = true AND (OLD.is_published = false OR OLD.is_published IS NULL) THEN
    INSERT INTO notifications (user_id, title, message, type)
    SELECT DISTINCT s.user_id,
      'Exam Results Published',
      'Results for "' || NEW.name || '" (' || NEW.term || ' ' || NEW.academic_year || ') are now available.',
      'exam_result'
    FROM exam_results er
    JOIN students s ON er.student_id = s.id
    WHERE er.exam_id = NEW.id
      AND s.user_id IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_exam_results_published
  AFTER UPDATE ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_exam_results_published();

-- 2. Trigger: When a study material is published, notify students in that class
CREATE OR REPLACE FUNCTION public.notify_study_material_published()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_published = true AND NEW.class_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type)
    SELECT DISTINCT s.user_id,
      'New Study Material',
      '"' || NEW.title || '" has been uploaded for your class.',
      'material'
    FROM student_classes sc
    JOIN students s ON sc.student_id = s.id
    WHERE sc.class_id = NEW.class_id
      AND s.user_id IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_study_material_published
  AFTER INSERT ON public.study_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_study_material_published();

-- 3. Trigger: When a public announcement is created, notify all students
CREATE OR REPLACE FUNCTION public.notify_announcement_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_public = true THEN
    INSERT INTO notifications (user_id, title, message, type)
    SELECT DISTINCT s.user_id,
      'New Announcement',
      '"' || NEW.title || '"',
      'announcement'
    FROM students s
    WHERE s.user_id IS NOT NULL
      AND s.status = 'active';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_announcement_created
  AFTER INSERT ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_announcement_created();
