
ALTER TABLE public.subscriptions REPLICA IDENTITY FULL;
ALTER TABLE public.payments REPLICA IDENTITY FULL;
ALTER TABLE public.access_grants REPLICA IDENTITY FULL;
ALTER TABLE public.parent_students REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.access_grants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parent_students;
