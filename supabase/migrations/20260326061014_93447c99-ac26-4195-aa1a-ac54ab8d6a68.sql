
-- Allow HOD to update leave_requests (approve/reject)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'HOD update leave_requests' AND tablename = 'leave_requests') THEN
    CREATE POLICY "HOD update leave_requests" ON public.leave_requests FOR UPDATE TO authenticated
    USING (has_role(auth.uid(), 'hod'::app_role))
    WITH CHECK (has_role(auth.uid(), 'hod'::app_role));
  END IF;
END $$;

-- HOD read staff
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'HOD read staff' AND tablename = 'staff') THEN
    CREATE POLICY "HOD read staff" ON public.staff FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'hod'::app_role));
  END IF;
END $$;

-- HOD read students
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'HOD read students' AND tablename = 'students') THEN
    CREATE POLICY "HOD read students" ON public.students FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'hod'::app_role));
  END IF;
END $$;

-- HOD read classes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'HOD read classes' AND tablename = 'classes') THEN
    CREATE POLICY "HOD read classes" ON public.classes FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'hod'::app_role));
  END IF;
END $$;

-- HOD read subjects
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'HOD read subjects' AND tablename = 'subjects') THEN
    CREATE POLICY "HOD read subjects" ON public.subjects FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'hod'::app_role));
  END IF;
END $$;

-- HOD read class_subjects
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'HOD read class_subjects' AND tablename = 'class_subjects') THEN
    CREATE POLICY "HOD read class_subjects" ON public.class_subjects FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'hod'::app_role));
  END IF;
END $$;

-- HOD read enrollments
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'HOD read enrollments' AND tablename = 'enrollments') THEN
    CREATE POLICY "HOD read enrollments" ON public.enrollments FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'hod'::app_role));
  END IF;
END $$;

-- HOD read marks
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'HOD read marks' AND tablename = 'marks') THEN
    CREATE POLICY "HOD read marks" ON public.marks FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'hod'::app_role));
  END IF;
END $$;

-- HOD read announcements
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'HOD read announcements' AND tablename = 'announcements') THEN
    CREATE POLICY "HOD read announcements" ON public.announcements FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'hod'::app_role));
  END IF;
END $$;
