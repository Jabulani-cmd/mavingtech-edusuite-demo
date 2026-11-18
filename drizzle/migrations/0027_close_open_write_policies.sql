-- Security hardening: close row-level security policies that let anonymous or any signed-in user
-- write data they should not. Reads, the timetable tables and is_conversation_member() are already
-- handled by 20260923120000, so this file only tightens the remaining write policies.
-- Idempotent: every policy is dropped before it is created.

-- 2. Anyone (including anonymous callers) could insert any profile row.
DROP POLICY IF EXISTS "Service insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- 3. Website content and settings: only school administrators may change it.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('carousel_images','Authenticated can manage carousel'), ('facility_images','Authenticated can manage facility_images'),
    ('gallery_images','Authenticated can manage gallery'), ('school_projects','Authenticated can manage projects'),
    ('site_settings','Authenticated can manage site_settings')) AS t(tbl, pol)
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.pol, r.tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.tbl || '_admin_manage', r.tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_school_admin(auth.uid())) WITH CHECK (public.is_school_admin(auth.uid()))', r.tbl || '_admin_manage', r.tbl);
  END LOOP;
END $$;

-- Downloads and meetings are also managed by teaching staff.
DROP POLICY IF EXISTS "Authenticated can manage downloads" ON public.downloads;
DROP POLICY IF EXISTS "downloads_staff_manage" ON public.downloads;
CREATE POLICY "downloads_staff_manage" ON public.downloads FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','supervisor','hod','teacher']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','supervisor','hod','teacher']::app_role[]));
DROP POLICY IF EXISTS "Authenticated can manage meetings" ON public.meetings;
DROP POLICY IF EXISTS "meetings_staff_manage" ON public.meetings;
CREATE POLICY "meetings_staff_manage" ON public.meetings FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','supervisor','hod','teacher']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','supervisor','hod','teacher']::app_role[]));

-- 4. Notifications may only be created by staff or for yourself; audit entries must be recorded under the caller's own id.
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_scoped" ON public.notifications;
CREATE POLICY "notifications_insert_scoped" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','supervisor','hod','teacher','registration','finance','bursar','finance_clerk']::app_role[]));

DROP POLICY IF EXISTS "System can insert audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_own" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_own" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 5. Messages could be posted under any sender id, and anyone could add themselves to any conversation.
--    (Read access is already limited to members by 20260923120000, using public.is_conversation_member.)
DROP POLICY IF EXISTS "Authenticated insert messages" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_conversation_member(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Authenticated insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "conversations_insert_own" ON public.conversations;
CREATE POLICY "conversations_insert_own" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Authenticated insert conversation_participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Authenticated can insert conversation_participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "participants_insert_creator_or_self" ON public.conversation_participants;
CREATE POLICY "participants_insert_creator_or_self" ON public.conversation_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.created_by = auth.uid()));
