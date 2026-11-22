CREATE OR REPLACE FUNCTION public.school_data_health()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_school_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only school administrators can run this check';
  END IF;
  WITH teachers AS (
    SELECT s.id, s.full_name, s.email FROM staff s
    WHERE coalesce(s.status,'active') <> 'inactive'
      AND (lower(coalesce(s.role,'')) = 'teacher'
           OR (s.user_id IS NOT NULL AND EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = s.user_id AND ur.role = 'teacher')))
  ), t_noclass AS (
    SELECT t.* FROM teachers t
    WHERE NOT EXISTS (SELECT 1 FROM classes c WHERE c.class_teacher_id = t.id)
      AND NOT EXISTS (SELECT 1 FROM class_subjects cs WHERE cs.teacher_id = t.id)
      AND NOT EXISTS (SELECT 1 FROM timetable_entries te WHERE te.teacher_id = t.id)
  ), c_noteacher AS (
    SELECT c.id, c.name FROM classes c
    WHERE NOT EXISTS (SELECT 1 FROM class_subjects cs WHERE cs.class_id = c.id AND cs.teacher_id IS NOT NULL)
  ), c_noct AS (
    SELECT c.id, c.name FROM classes c WHERE c.class_teacher_id IS NULL
  ), cs_null AS (
    SELECT cs.id FROM class_subjects cs WHERE cs.teacher_id IS NULL
  ), s_noclass AS (
    SELECT st.id, st.full_name, st.admission_number FROM students st
    WHERE coalesce(st.status,'active') = 'active'
      AND NOT EXISTS (SELECT 1 FROM student_classes sc WHERE sc.student_id = st.id)
  ), unlinked AS (
    SELECT u.id, u.email, ur.role::text AS role FROM auth.users u
    JOIN user_roles ur ON ur.user_id = u.id AND ur.role IN ('teacher','student')
    WHERE (ur.role = 'teacher' AND NOT EXISTS (SELECT 1 FROM staff s WHERE s.user_id = u.id))
       OR (ur.role = 'student' AND NOT EXISTS (SELECT 1 FROM students st WHERE st.user_id = u.id))
    UNION ALL
    SELECT u.id, u.email, 'parent' FROM auth.users u
    JOIN user_roles ur ON ur.user_id = u.id AND ur.role = 'parent'
    WHERE NOT EXISTS (SELECT 1 FROM parent_students ps WHERE ps.parent_id = u.id)
      AND NOT EXISTS (SELECT 1 FROM parent_student_links pl WHERE pl.parent_id = u.id)
  ), noprofile AS (
    SELECT u.id FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)
  )
  SELECT jsonb_build_object(
    'teachers_without_class', (SELECT count(*) FROM t_noclass),
    'classes_without_subject_teacher', (SELECT count(*) FROM c_noteacher),
    'classes_without_class_teacher', (SELECT count(*) FROM c_noct),
    'subjects_without_teacher', (SELECT count(*) FROM cs_null),
    'students_without_class', (SELECT count(*) FROM s_noclass),
    'logins_not_linked', (SELECT count(*) FROM unlinked),
    'logins_without_profile', (SELECT count(*) FROM noprofile),
    'samples', jsonb_build_object(
      'teachers_without_class', (SELECT coalesce(jsonb_agg(full_name || ' <' || coalesce(email,'') || '>'), '[]') FROM (SELECT * FROM t_noclass LIMIT 20) x),
      'classes_without_subject_teacher', (SELECT coalesce(jsonb_agg(name), '[]') FROM (SELECT * FROM c_noteacher LIMIT 20) x),
      'classes_without_class_teacher', (SELECT coalesce(jsonb_agg(name), '[]') FROM (SELECT * FROM c_noct LIMIT 20) x),
      'students_without_class', (SELECT coalesce(jsonb_agg(full_name || ' (' || coalesce(admission_number,'') || ')'), '[]') FROM (SELECT * FROM s_noclass LIMIT 20) x),
      'logins_not_linked', (SELECT coalesce(jsonb_agg(email || ' [' || role || ']'), '[]') FROM (SELECT * FROM unlinked LIMIT 20) x)
    )
  ) INTO r;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.sync_school_links()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  n_staff int := 0; n_staff_new int := 0; n_students int := 0; n_ps int := 0; n_pl int := 0; n_ag int := 0;
  n_roles int := 0; n_prof int := 0; n_classes int := 0; n_roster int := 0; n_cs_tt int := 0; n_cs_new int := 0;
  n_cs_fill int := 0; n_ct int := 0; n_tt int := 0; k int;
  rec record; pick uuid;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_school_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only school administrators can re-link school records';
  END IF;

  -- 1. Staff and learners linked to their logins by email
  UPDATE staff s SET user_id = u.id FROM auth.users u
   WHERE s.user_id IS NULL AND s.email IS NOT NULL AND lower(u.email) = lower(s.email)
     AND NOT EXISTS (SELECT 1 FROM staff s2 WHERE s2.user_id = u.id);
  GET DIAGNOSTICS n_staff = ROW_COUNT;

  -- 2. Teacher logins without any staff record get one
  INSERT INTO staff (user_id, full_name, email, role, category, status)
  SELECT u.id, coalesce(p.full_name, u.email), u.email, 'teacher', 'teaching', 'active'
    FROM auth.users u JOIN user_roles ur ON ur.user_id = u.id AND ur.role = 'teacher'
    LEFT JOIN profiles p ON p.id = u.id
   WHERE NOT EXISTS (SELECT 1 FROM staff s WHERE s.user_id = u.id OR lower(s.email) = lower(u.email));
  GET DIAGNOSTICS n_staff_new = ROW_COUNT;

  UPDATE students st SET user_id = u.id FROM auth.users u
   WHERE st.user_id IS NULL AND st.email IS NOT NULL AND lower(u.email) = lower(st.email)
     AND NOT EXISTS (SELECT 1 FROM students s2 WHERE s2.user_id = u.id);
  GET DIAGNOSTICS n_students = ROW_COUNT;

  -- 3. Parent links kept in step across the three link tables
  INSERT INTO parent_students (parent_id, student_id)
  SELECT DISTINCT pl.parent_id, pl.student_id FROM parent_student_links pl
   WHERE EXISTS (SELECT 1 FROM students st WHERE st.id = pl.student_id)
  ON CONFLICT (parent_id, student_id) DO NOTHING;
  GET DIAGNOSTICS n_ps = ROW_COUNT;

  INSERT INTO parent_student_links (parent_id, student_id, verified)
  SELECT DISTINCT ps.parent_id, ps.student_id, true FROM parent_students ps
   WHERE NOT EXISTS (SELECT 1 FROM parent_student_links pl WHERE pl.parent_id = ps.parent_id AND pl.student_id = ps.student_id);
  GET DIAGNOSTICS n_pl = ROW_COUNT;

  -- Free access only for demo parents; real parents still subscribe
  INSERT INTO access_grants (parent_id, student_id, grant_type, reason, is_active)
  SELECT DISTINCT ps.parent_id, ps.student_id, 'complimentary', 'Demo account', true
    FROM parent_students ps JOIN auth.users u ON u.id = ps.parent_id
   WHERE lower(u.email) LIKE '%schooldemo.com'
     AND NOT EXISTS (SELECT 1 FROM access_grants ag WHERE ag.parent_id = ps.parent_id AND ag.student_id = ps.student_id);
  GET DIAGNOSTICS n_ag = ROW_COUNT;

  -- 4. Roles and profiles for every linked login
  INSERT INTO user_roles (user_id, role)
  SELECT DISTINCT s.user_id, 'teacher'::app_role FROM staff s
   WHERE s.user_id IS NOT NULL AND lower(coalesce(s.role,'')) = 'teacher'
     AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = s.user_id)
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS k = ROW_COUNT; n_roles := n_roles + k;
  INSERT INTO user_roles (user_id, role)
  SELECT DISTINCT st.user_id, 'student'::app_role FROM students st
   WHERE st.user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = st.user_id)
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS k = ROW_COUNT; n_roles := n_roles + k;
  INSERT INTO user_roles (user_id, role)
  SELECT DISTINCT ps.parent_id, 'parent'::app_role FROM parent_students ps
   WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = ps.parent_id)
     AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = ps.parent_id)
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS k = ROW_COUNT; n_roles := n_roles + k;

  INSERT INTO profiles (id, user_id, full_name, email)
  SELECT u.id, u.id, coalesce(u.raw_user_meta_data->>'full_name', u.email), u.email FROM auth.users u
   WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)
  ON CONFLICT (id) DO NOTHING;
  GET DIAGNOSTICS n_prof = ROW_COUNT;

  -- 5. Classes named on learner records exist, and every learner is on a roster
  INSERT INTO classes (name, level, stream)
  SELECT DISTINCT coalesce(nullif(st.class,''), st.form || st.stream), st.form, st.stream FROM students st
   WHERE coalesce(nullif(st.class,''), st.form || st.stream) IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM classes c WHERE lower(c.name) = lower(coalesce(nullif(st.class,''), st.form || st.stream)));
  GET DIAGNOSTICS n_classes = ROW_COUNT;

  INSERT INTO student_classes (student_id, class_id)
  SELECT st.id, (SELECT c.id FROM classes c WHERE lower(c.name) = lower(coalesce(nullif(st.class,''), st.form || st.stream)) ORDER BY c.created_at LIMIT 1)
    FROM students st
   WHERE NOT EXISTS (SELECT 1 FROM student_classes sc WHERE sc.student_id = st.id)
     AND EXISTS (SELECT 1 FROM classes c WHERE lower(c.name) = lower(coalesce(nullif(st.class,''), st.form || st.stream)));
  GET DIAGNOSTICS n_roster = ROW_COUNT;

  -- 6. Subject teachers from the timetable
  UPDATE class_subjects cs SET teacher_id = te.teacher_id
    FROM (SELECT DISTINCT ON (class_id, subject_id) class_id, subject_id, teacher_id FROM timetable_entries
           WHERE teacher_id IS NOT NULL AND subject_id IS NOT NULL ORDER BY class_id, subject_id, created_at DESC) te
   WHERE cs.teacher_id IS NULL AND cs.class_id = te.class_id AND cs.subject_id = te.subject_id;
  GET DIAGNOSTICS n_cs_tt = ROW_COUNT;

  INSERT INTO class_subjects (class_id, subject_id, teacher_id)
  SELECT DISTINCT ON (te.class_id, te.subject_id) te.class_id, te.subject_id, te.teacher_id FROM timetable_entries te
   WHERE te.subject_id IS NOT NULL AND te.teacher_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM class_subjects cs WHERE cs.class_id = te.class_id AND cs.subject_id = te.subject_id)
   ORDER BY te.class_id, te.subject_id, te.created_at DESC
  ON CONFLICT (class_id, subject_id) DO NOTHING;
  GET DIAGNOSTICS n_cs_new = ROW_COUNT;

  -- 7. Remaining empty subject slots go to the least-busy teacher of that subject
  FOR rec IN SELECT cs.id, sub.name FROM class_subjects cs JOIN subjects sub ON sub.id = cs.subject_id WHERE cs.teacher_id IS NULL LOOP
    SELECT s.id INTO pick FROM staff s
     WHERE s.subjects_taught IS NOT NULL AND rec.name = ANY (s.subjects_taught) AND coalesce(s.status,'active') <> 'inactive'
     ORDER BY (SELECT count(*) FROM class_subjects c2 WHERE c2.teacher_id = s.id), s.created_at LIMIT 1;
    IF pick IS NOT NULL THEN
      UPDATE class_subjects SET teacher_id = pick WHERE id = rec.id AND teacher_id IS NULL;
      n_cs_fill := n_cs_fill + 1;
    END IF;
  END LOOP;

  -- Teachers who still teach nothing pick up their subject in a class that lacks it
  FOR rec IN SELECT s.id, s.subjects_taught FROM staff s
     WHERE s.subjects_taught IS NOT NULL AND lower(coalesce(s.role,'')) = 'teacher'
       AND NOT EXISTS (SELECT 1 FROM class_subjects cs WHERE cs.teacher_id = s.id)
       AND NOT EXISTS (SELECT 1 FROM classes c WHERE c.class_teacher_id = s.id)
       AND NOT EXISTS (SELECT 1 FROM timetable_entries te WHERE te.teacher_id = s.id) LOOP
    INSERT INTO class_subjects (class_id, subject_id, teacher_id)
    SELECT c.id, sub.id, rec.id FROM classes c CROSS JOIN subjects sub
     WHERE sub.name = ANY (rec.subjects_taught)
       AND NOT EXISTS (SELECT 1 FROM class_subjects cs WHERE cs.class_id = c.id AND cs.subject_id = sub.id)
     ORDER BY c.name LIMIT 1
    ON CONFLICT (class_id, subject_id) DO NOTHING;
    GET DIAGNOSTICS k = ROW_COUNT; n_cs_new := n_cs_new + k;
  END LOOP;

  -- 8. Classes without a class teacher take one of their own subject teachers
  FOR rec IN SELECT c.id FROM classes c WHERE c.class_teacher_id IS NULL LOOP
    SELECT cs.teacher_id INTO pick FROM class_subjects cs
     WHERE cs.class_id = rec.id AND cs.teacher_id IS NOT NULL
     ORDER BY (SELECT count(*) FROM classes c2 WHERE c2.class_teacher_id = cs.teacher_id), cs.created_at LIMIT 1;
    IF pick IS NOT NULL THEN
      UPDATE classes SET class_teacher_id = pick WHERE id = rec.id AND class_teacher_id IS NULL;
      n_ct := n_ct + 1;
    END IF;
  END LOOP;

  -- 9. Timetable periods without a teacher follow the class subject teacher
  UPDATE timetable_entries te SET teacher_id = cs.teacher_id FROM class_subjects cs
   WHERE te.teacher_id IS NULL AND cs.class_id = te.class_id AND cs.subject_id = te.subject_id AND cs.teacher_id IS NOT NULL;
  GET DIAGNOSTICS n_tt = ROW_COUNT;

  RETURN jsonb_build_object(
    'linked', jsonb_build_object('staff', n_staff, 'students', n_students, 'subject_teachers_from_timetable', n_cs_tt,
                                 'subject_teachers_filled', n_cs_fill, 'class_teachers', n_ct, 'timetable_periods', n_tt),
    'created', jsonb_build_object('staff_records', n_staff_new, 'parent_students', n_ps, 'parent_links', n_pl, 'demo_access_grants', n_ag,
                                  'roles', n_roles, 'profiles', n_prof, 'classes', n_classes, 'roster_places', n_roster, 'class_subjects', n_cs_new),
    'health', public.school_data_health()
  );
END $$;

REVOKE ALL ON FUNCTION public.sync_school_links() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.school_data_health() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_school_links() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.school_data_health() TO authenticated, service_role;

-- Automatic linking
CREATE OR REPLACE FUNCTION public.link_record_to_login()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid;
BEGIN
  IF NEW.user_id IS NULL AND NEW.email IS NOT NULL THEN
    SELECT u.id INTO uid FROM auth.users u WHERE lower(u.email) = lower(NEW.email) LIMIT 1;
    IF uid IS NOT NULL THEN
      IF TG_TABLE_NAME = 'staff' AND NOT EXISTS (SELECT 1 FROM staff WHERE user_id = uid) THEN NEW.user_id := uid;
      ELSIF TG_TABLE_NAME = 'students' AND NOT EXISTS (SELECT 1 FROM students WHERE user_id = uid) THEN NEW.user_id := uid;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS staff_link_login ON public.staff;
CREATE TRIGGER staff_link_login BEFORE INSERT OR UPDATE OF email, user_id ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.link_record_to_login();
DROP TRIGGER IF EXISTS students_link_login ON public.students;
CREATE TRIGGER students_link_login BEFORE INSERT OR UPDATE OF email, user_id ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.link_record_to_login();

CREATE OR REPLACE FUNCTION public.link_login_to_records()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    UPDATE public.staff SET user_id = NEW.id
     WHERE user_id IS NULL AND lower(email) = lower(NEW.email)
       AND NOT EXISTS (SELECT 1 FROM public.staff s2 WHERE s2.user_id = NEW.id);
    UPDATE public.students SET user_id = NEW.id
     WHERE user_id IS NULL AND lower(email) = lower(NEW.email)
       AND NOT EXISTS (SELECT 1 FROM public.students s2 WHERE s2.user_id = NEW.id);
  END IF;
  RETURN NEW;
EXCEPTION WHEN others THEN
  RETURN NEW; -- never block sign-up
END $$;

DROP TRIGGER IF EXISTS on_auth_user_link_records ON auth.users;
CREATE TRIGGER on_auth_user_link_records AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_login_to_records();

CREATE OR REPLACE FUNCTION public.class_subject_follow_timetable()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.teacher_id IS NOT NULL THEN
    UPDATE public.timetable_entries SET teacher_id = NEW.teacher_id
     WHERE class_id = NEW.class_id AND subject_id = NEW.subject_id
       AND (teacher_id IS NULL OR (TG_OP = 'UPDATE' AND teacher_id = OLD.teacher_id AND OLD.teacher_id IS DISTINCT FROM NEW.teacher_id));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS class_subjects_sync_timetable ON public.class_subjects;
CREATE TRIGGER class_subjects_sync_timetable AFTER INSERT OR UPDATE OF teacher_id ON public.class_subjects
  FOR EACH ROW EXECUTE FUNCTION public.class_subject_follow_timetable();