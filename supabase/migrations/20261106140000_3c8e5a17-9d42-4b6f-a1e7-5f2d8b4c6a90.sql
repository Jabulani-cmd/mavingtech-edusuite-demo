-- ============================================
-- RECORD THE LIVE VISIBILITY RULES FOR SUBJECTS, ROOMS AND MEETINGS
-- The live database already behaves like this (measured on 2026-11-06 with a visitor, a student,
-- a parent, a teacher and an administrator), but the rules were changed there directly and are not
-- in the earlier migrations. A database built only from these files would still let visitors read
-- meetings and let any signed-in user change them. This migration writes the live behaviour down:
--
--                          read      write
--   visitor (not signed in) no        no
--   student / parent        yes       no
--   teacher                 yes       no
--   administrator, principal, deputy principal, admin supervisor    yes       yes
--
-- * Any policy on these three tables that applies to visitors (role public or anon), or that lets
--   every signed-in user write (USING true), is dropped, whatever it is called.
-- * Other staff rules (for example HODs managing subjects) are left alone.
-- * One read rule for signed-in users and one write rule for school administrators are (re)created.
-- On the live database the dropped rules are already gone, so this changes nothing there.
-- Idempotent: safe to run more than once.
-- ============================================

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('subjects', 'rooms', 'meetings')
      AND (
        roles && ARRAY['public', 'anon']::name[]
        OR (cmd <> 'SELECT' AND replace(coalesce(qual, ''), ' ', '') IN ('true', '(auth.uid()ISNOTNULL)', '(auth.role()=''authenticated''::text)'))
      )
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['subjects', 'rooms', 'meetings'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    -- Everyone signed in can read (students and parents see their timetable's subjects, rooms and meetings).
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_signed_in_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)', t || '_signed_in_read', t);

    -- Only school administrators change them (the admin dashboard is where they are managed).
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_write', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
         USING (public.is_school_admin(auth.uid())) WITH CHECK (public.is_school_admin(auth.uid()))',
      t || '_admin_write', t);
  END LOOP;
END $$;
