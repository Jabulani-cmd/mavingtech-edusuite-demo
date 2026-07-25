
-- Guarantee unique student/class pairs so ON CONFLICT can dedupe
ALTER TABLE public.student_classes
  DROP CONSTRAINT IF EXISTS student_classes_student_class_unique;
CREATE UNIQUE INDEX IF NOT EXISTS student_classes_student_class_unique
  ON public.student_classes (student_id, class_id);

-- Trigger fires on INSERT and on any grade/class/stream/status change
DROP TRIGGER IF EXISTS trg_auto_link_student_class ON public.students;
CREATE TRIGGER trg_auto_link_student_class
AFTER INSERT OR UPDATE OF form, class, stream, status ON public.students
FOR EACH ROW EXECUTE FUNCTION public.auto_link_student_class();

-- Migrate legacy Zimbabwean Form students onto SA Grade classes
UPDATE public.students SET
  form  = CASE form
            WHEN 'Form 1' THEN 'Grade 8'
            WHEN 'Form 2' THEN 'Grade 9'
            WHEN 'Form 3' THEN 'Grade 10'
            WHEN 'Form 4' THEN 'Grade 11'
            WHEN 'Form 5' THEN 'Grade 12'
            WHEN 'Form 6' THEN 'Grade 12'
            ELSE form
          END,
  class = CASE
            WHEN class LIKE 'Form 1%' THEN replace(class,'Form 1','Grade 8')
            WHEN class LIKE 'Form 2%' THEN replace(class,'Form 2','Grade 9')
            WHEN class LIKE 'Form 3%' THEN replace(class,'Form 3','Grade 10')
            WHEN class LIKE 'Form 4%' THEN replace(class,'Form 4','Grade 11')
            WHEN class LIKE 'Form 5%' THEN replace(class,'Form 5','Grade 12')
            WHEN class LIKE 'Form 6%' THEN replace(class,'Form 6','Grade 12')
            ELSE class
          END
WHERE form LIKE 'Form %' OR class LIKE 'Form %';

-- Drop stale links to old Form classes and re-link via trigger
DELETE FROM public.student_classes sc
USING public.classes c
WHERE sc.class_id = c.id AND c.name LIKE 'Form %';

UPDATE public.students SET updated_at = now() WHERE status = 'active';

-- Remove now-empty legacy Form classes
DELETE FROM public.classes
WHERE name LIKE 'Form %'
  AND NOT EXISTS (SELECT 1 FROM public.student_classes sc WHERE sc.class_id = classes.id)
  AND NOT EXISTS (SELECT 1 FROM public.timetable_entries te WHERE te.class_id = classes.id);

-- Realtime broadcasts (ignore if already added)
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.student_classes; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.students;        EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.timetable_entries; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;         EXCEPTION WHEN duplicate_object THEN NULL; END;
END$$;
