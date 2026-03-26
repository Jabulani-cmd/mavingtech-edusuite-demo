
-- Conversations table (direct, group, broadcast)
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'broadcast')),
  name text,
  created_by uuid NOT NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversation participants
CREATE TABLE public.conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'alert', 'system')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;

-- RLS: Users can see conversations they participate in
CREATE POLICY "Users read own conversations"
ON public.conversations FOR SELECT TO authenticated
USING (
  id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
  OR created_by = auth.uid()
);

-- Admins can create any conversation, others can create direct/group
CREATE POLICY "Authenticated create conversations"
ON public.conversations FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- Update own conversations
CREATE POLICY "Creator update conversations"
ON public.conversations FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Participants: users see their own participation
CREATE POLICY "Users read own participation"
ON public.conversation_participants FOR SELECT TO authenticated
USING (user_id = auth.uid() OR conversation_id IN (
  SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
));

-- Users can be added to conversations by the creator or admin
CREATE POLICY "Add participants"
ON public.conversation_participants FOR INSERT TO authenticated
WITH CHECK (
  conversation_id IN (SELECT id FROM public.conversations WHERE created_by = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'teacher'::app_role)
);

-- Users can update their own last_read_at
CREATE POLICY "Users update own participation"
ON public.conversation_participants FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Messages: users read messages in their conversations
CREATE POLICY "Users read conversation messages"
ON public.messages FOR SELECT TO authenticated
USING (conversation_id IN (
  SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
));

-- Users send messages in conversations they belong to
CREATE POLICY "Users send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND conversation_id IN (
    SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
  )
);

-- Index for performance
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_conv_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_conv_participants_conv ON public.conversation_participants(conversation_id);
