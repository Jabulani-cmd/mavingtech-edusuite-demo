-- Allow newly registered users to assign themselves the 'parent' role
CREATE POLICY "Users insert own parent role"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role = 'parent');
