GRANT SELECT, INSERT, UPDATE ON public.conversation_participants TO authenticated;
GRANT ALL ON public.conversation_participants TO service_role;

DROP POLICY IF EXISTS "conversation_participants_own_update_last_read" ON public.conversation_participants;
CREATE POLICY "conversation_participants_own_update_last_read"
ON public.conversation_participants
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());