
-- =============================================
-- FIX 1: Staff table - Remove overly permissive policies
-- =============================================

-- Drop all broad SELECT policies on staff
DROP POLICY IF EXISTS "Anyone read staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated read staff" ON public.staff;
DROP POLICY IF EXISTS "Allow authenticated read staff" ON public.staff;
DROP POLICY IF EXISTS "Allow authenticated users to view staff" ON public.staff;
DROP POLICY IF EXISTS "Allow admins to view staff" ON public.staff;

-- Create a public view exposing ONLY safe columns for the public website
CREATE OR REPLACE VIEW public.staff_public AS
SELECT id, full_name, title, department, bio, photo_url, category
FROM public.staff;

-- Grant access to the view for anon and authenticated roles
GRANT SELECT ON public.staff_public TO anon, authenticated;

-- Add a restrictive SELECT policy: only admins, principals, admin_supervisors, HODs, deputy principals can read full staff records
-- (Management read staff and Teachers read own already exist)
CREATE POLICY "Authenticated teachers read staff" ON public.staff
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'teacher'));

-- =============================================
-- FIX 2: User roles - Remove blanket read policies
-- =============================================

DROP POLICY IF EXISTS "Allow authenticated read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow read user_roles" ON public.user_roles;

-- Remove the unrestricted parent self-assignment policy
DROP POLICY IF EXISTS "Users insert own parent role" ON public.user_roles;
