
-- Drop the recursive policy
DROP POLICY IF EXISTS "Users read own participation" ON public.conversation_participants;

-- Create a security definer function to check participation without triggering RLS
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE user_id = _user_id AND conversation_id = _conversation_id
  )
$$;

-- Recreate the policy using the security definer function (no self-reference)
CREATE POLICY "Users read own participation"
ON public.conversation_participants FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_conversation_participant(auth.uid(), conversation_id)
);

-- Also fix conversations SELECT policy which has same issue
DROP POLICY IF EXISTS "Users read own conversations" ON public.conversations;
CREATE POLICY "Users read own conversations"
ON public.conversations FOR SELECT TO authenticated
USING (
  created_by = auth.uid()
  OR public.is_conversation_participant(auth.uid(), id)
);

-- Fix messages SELECT policy 
DROP POLICY IF EXISTS "Users read conversation messages" ON public.messages;
CREATE POLICY "Users read conversation messages"
ON public.messages FOR SELECT TO authenticated
USING (
  public.is_conversation_participant(auth.uid(), conversation_id)
);

-- Fix messages INSERT policy
DROP POLICY IF EXISTS "Users send messages" ON public.messages;
CREATE POLICY "Users send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND public.is_conversation_participant(auth.uid(), conversation_id)
);
