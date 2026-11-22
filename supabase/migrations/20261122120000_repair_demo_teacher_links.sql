-- ============================================
-- REPAIR DEMO TEACHER AND ROSTER LINKS
-- A demo teacher could open the Marks tab and see "You are not assigned to any class yet", with an empty student
-- list, when the demo data and the demo logins were loaded in a different order. This links the pieces again:
-- * staff.user_id for every @schooldemo.com teacher/staff record, taken from the login with the same email
-- * the teacher role for those logins
-- * class_subjects.teacher_id filled from the demo timetable where it is empty
-- * students with no class are placed in the class named in students.class (for example "Form 1A")
-- Only demo-domain records are touched. Every UPDATE and INSERT has a WHERE, as the live database requires.
-- Idempotent: safe to run more than once.
-- ============================================

UPDATE public.staff s
SET user_id = u.id
FROM auth.users u
WHERE lower(u.email) = lower(s.email)
  AND lower(s.email) LIKE '%@schooldemo.com'
  AND s.user_id IS DISTINCT FROM u.id;

INSERT INTO public.user_roles (user_id, role)
SELECT s.user_id, 'teacher'::app_role
FROM public.staff s
WHERE s.role = 'teacher' AND s.user_id IS NOT NULL AND lower(s.email) LIKE '%@schooldemo.com'
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.class_subjects cs
SET teacher_id = t.teacher_id
FROM (
  SELECT class_id, subject_id, (array_agg(teacher_id))[1] AS teacher_id
  FROM public.timetable_entries
  WHERE term = 'DEMO' AND teacher_id IS NOT NULL
  GROUP BY class_id, subject_id
) t
WHERE cs.class_id = t.class_id AND cs.subject_id = t.subject_id AND cs.teacher_id IS NULL;

INSERT INTO public.student_classes (student_id, class_id)
SELECT st.id, c.id
FROM public.students st
JOIN public.classes c ON lower(c.name) = lower(st.class)
WHERE lower(st.email) LIKE '%@schooldemo.com'
  AND NOT EXISTS (SELECT 1 FROM public.student_classes sc WHERE sc.student_id = st.id);

NOTIFY pgrst, 'reload schema';
