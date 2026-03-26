
-- Fix students table: the codebase uses full_name as a writable column
-- Drop the generated full_name column and recreate as regular column
ALTER TABLE public.students DROP COLUMN IF EXISTS full_name;
ALTER TABLE public.students ADD COLUMN full_name TEXT NOT NULL DEFAULT '';

-- Make first_name and last_name nullable since the app uses full_name
ALTER TABLE public.students ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE public.students ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE public.students ALTER COLUMN first_name SET DEFAULT '';
ALTER TABLE public.students ALTER COLUMN last_name SET DEFAULT '';

-- Create conversation_participants table (referenced by MessagingPanel, getting 404)
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_read_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations" ON public.conversation_participants
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can insert conversation_participants" ON public.conversation_participants
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own participation" ON public.conversation_participants
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view conversations" ON public.conversations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (true);

-- Add foreign key now that conversations table exists
ALTER TABLE public.conversation_participants 
  ADD CONSTRAINT fk_conversation 
  FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
