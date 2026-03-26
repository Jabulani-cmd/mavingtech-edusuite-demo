
-- Fix the security definer view issue by setting it to security invoker
ALTER VIEW public.staff_public SET (security_invoker = on);
