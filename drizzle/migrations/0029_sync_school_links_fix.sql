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

  UPDATE staff s SET user_id = u.id FROM auth.users u
   WHERE s.user_id IS NULL AND s.email IS NOT NULL AND lower(u.email) = lower(s.email)
     AND NOT EXISTS (SELECT 1 FROM staff s2 WHERE s2.user_id = u.id);
  GET DIAGNOSTICS n_staff = ROW_COUNT;

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
  SELECT DISTINCT ps.parent_id, ps.student_id, 'complimentary'::grant_type, 'Demo account', true
    FROM parent_students ps JOIN auth.users u ON u.id = ps.parent_id
   WHERE lower(u.email) LIKE '%schooldemo.com'
     AND NOT EXISTS (SELECT 1 FROM access_grants ag WHERE ag.parent_id = ps.parent_id AND ag.student_id = ps.student_id);
  GET DIAGNOSTICS n_ag = ROW_COUNT;

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
  -- (demo teachers with no subjects listed take any open subject)
  FOR rec IN SELECT s.id, s.subjects_taught, s.email FROM staff s
     WHERE lower(coalesce(s.role,'')) = 'teacher'
       AND NOT EXISTS (SELECT 1 FROM class_subjects cs WHERE cs.teacher_id = s.id)
       AND NOT EXISTS (SELECT 1 FROM classes c WHERE c.class_teacher_id = s.id)
       AND NOT EXISTS (SELECT 1 FROM timetable_entries te WHERE te.teacher_id = s.id) LOOP
    INSERT INTO class_subjects (class_id, subject_id, teacher_id)
    SELECT c.id, sub.id, rec.id FROM classes c CROSS JOIN subjects sub
     WHERE (sub.name = ANY (coalesce(rec.subjects_taught, '{}'::text[]))
            OR (coalesce(cardinality(rec.subjects_taught), 0) = 0 AND lower(coalesce(rec.email,'')) LIKE '%@schooldemo.com'))
       AND NOT EXISTS (SELECT 1 FROM class_subjects cs WHERE cs.class_id = c.id AND cs.subject_id = sub.id)
     ORDER BY (SELECT count(*) FROM class_subjects c3 WHERE c3.class_id = c.id), c.name, sub.name LIMIT 1
    ON CONFLICT (class_id, subject_id) DO NOTHING;
    GET DIAGNOSTICS k = ROW_COUNT; n_cs_new := n_cs_new + k;
  END LOOP;

  FOR rec IN SELECT c.id FROM classes c WHERE c.class_teacher_id IS NULL LOOP
    SELECT cs.teacher_id INTO pick FROM class_subjects cs
     WHERE cs.class_id = rec.id AND cs.teacher_id IS NOT NULL
     ORDER BY (SELECT count(*) FROM classes c2 WHERE c2.class_teacher_id = cs.teacher_id), cs.created_at LIMIT 1;
    IF pick IS NOT NULL THEN
      UPDATE classes SET class_teacher_id = pick WHERE id = rec.id AND class_teacher_id IS NULL;
      n_ct := n_ct + 1;
    END IF;
  END LOOP;

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