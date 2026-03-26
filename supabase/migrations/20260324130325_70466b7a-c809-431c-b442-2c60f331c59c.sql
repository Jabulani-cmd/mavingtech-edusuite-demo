
-- Enable RLS on the users table (it's a legacy table not used by the app)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Add restrictive policies: only admins can read
CREATE POLICY "Admins read all users" ON public.users
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Users can read own record
CREATE POLICY "Users read own record" ON public.users
  FOR SELECT USING (auth.uid() = id);
