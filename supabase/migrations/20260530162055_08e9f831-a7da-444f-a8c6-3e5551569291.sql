-- Allow all authenticated users to look up basic profile info (id, name, avatar, email)
-- so the in-app messaging directory and user search work for everyone, not just admins.
CREATE POLICY "profiles_read_authenticated_directory"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);