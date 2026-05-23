
-- Add missing columns to staff table
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS national_id text,
  ADD COLUMN IF NOT EXISTS employment_date date,
  ADD COLUMN IF NOT EXISTS subjects_taught text[];

-- Backfill staff rows from profiles for any user with a staff-like role that doesn't have a staff record yet
INSERT INTO public.staff (user_id, full_name, email, phone, role, category, status)
SELECT
  p.id,
  COALESCE(p.full_name, p.email),
  p.email,
  p.phone,
  p.role::text,
  CASE
    WHEN p.role::text IN ('principal','deputy_principal') THEN 'leadership'
    WHEN p.role::text IN ('bursar','finance_clerk','secretary','admin','admin_supervisor','supervisor') THEN 'administrative'
    WHEN p.role::text IN ('groundsman','matron') THEN 'general'
    ELSE 'teaching'
  END,
  'active'
FROM public.profiles p
WHERE p.role::text NOT IN ('student','parent')
  AND NOT EXISTS (SELECT 1 FROM public.staff s WHERE s.user_id = p.id);
