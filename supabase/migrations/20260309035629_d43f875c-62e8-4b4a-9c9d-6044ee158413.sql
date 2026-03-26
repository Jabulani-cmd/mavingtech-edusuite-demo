
-- Function to auto-provision a student: assign class, enrollment, subjects, and timetable
CREATE OR REPLACE FUNCTION public.auto_provision_student()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_class_id uuid;
  v_class_name text;
  v_academic_year text := to_char(now(), 'YYYY');
  v_subject RECORD;
  v_entry RECORD;
BEGIN
  -- Only run on new active students with a form
  IF NEW.status != 'active' OR NEW.form IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find matching class by form_level + stream
  IF NEW.stream IS NOT NULL AND NEW.stream != '' THEN
    SELECT id, name INTO v_class_id, v_class_name
    FROM classes
    WHERE form_level = NEW.form AND stream = NEW.stream
    LIMIT 1;
  END IF;

  -- If no match with stream, try form_level only
  IF v_class_id IS NULL THEN
    SELECT id, name INTO v_class_id, v_class_name
    FROM classes
    WHERE form_level = NEW.form
    ORDER BY 
      CASE WHEN stream = 'A' THEN 0 ELSE 1 END
    LIMIT 1;
  END IF;

  -- If a class was found, auto-assign everything
  IF v_class_id IS NOT NULL THEN
    -- 1. Insert into student_classes (if not exists)
    INSERT INTO student_classes (student_id, class_id)
    VALUES (NEW.id, v_class_id)
    ON CONFLICT DO NOTHING;

    -- 2. Create enrollment record
    INSERT INTO enrollments (student_id, class_id, academic_year, enrollment_date)
    VALUES (NEW.id, v_class_id, v_academic_year, COALESCE(NEW.enrollment_date, CURRENT_DATE))
    ON CONFLICT DO NOTHING;

    -- 3. Copy timetable entries into personal_timetables (if the student has a user_id)
    IF NEW.user_id IS NOT NULL THEN
      FOR v_entry IN
        SELECT te.day_of_week, te.start_time, te.end_time, te.room,
               s.name as subject_name
        FROM timetable_entries te
        LEFT JOIN subjects s ON s.id = te.subject_id
        WHERE te.class_id = v_class_id
          AND te.academic_year = v_academic_year
      LOOP
        INSERT INTO personal_timetables (
          user_id, day_of_week, time_slot, end_time, activity, activity_type, location
        ) VALUES (
          NEW.user_id,
          v_entry.day_of_week,
          v_entry.start_time,
          v_entry.end_time,
          COALESCE(v_entry.subject_name, 'Class'),
          'class',
          v_entry.room
        );
      END LOOP;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on students table
DROP TRIGGER IF EXISTS trg_auto_provision_student ON public.students;
CREATE TRIGGER trg_auto_provision_student
  AFTER INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_provision_student();
