INSERT INTO public.user_roles (user_id, role)
SELECT s.user_id, s.role::public.app_role
FROM public.staff s
LEFT JOIN public.user_roles ur ON ur.user_id = s.user_id
WHERE s.role IN ('bursar','finance_clerk')
  AND s.user_id IS NOT NULL
  AND ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;