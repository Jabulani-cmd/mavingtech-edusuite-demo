
-- Backfill profiles for any auth users missing a profile row.
INSERT INTO public.profiles (id, user_id, full_name, email, phone, role)
SELECT
  au.id,
  au.id,
  COALESCE(
    NULLIF(au.raw_user_meta_data->>'full_name',''),
    NULLIF(s.full_name,''),
    NULLIF(st.full_name,''),
    split_part(COALESCE(au.email,''),'@',1)
  ) AS full_name,
  au.email,
  COALESCE(st.phone, s.guardian_phone) AS phone,
  ur.role::text AS role
FROM auth.users au
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
LEFT JOIN public.staff st ON st.user_id = au.id
LEFT JOIN public.students s ON s.user_id = au.id
LEFT JOIN public.profiles p ON p.id = au.id OR p.user_id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
