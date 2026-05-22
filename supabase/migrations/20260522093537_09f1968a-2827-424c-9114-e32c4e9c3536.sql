ALTER PUBLICATION supabase_realtime ADD TABLE public.tt_definitions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tt_slots;
ALTER TABLE public.tt_definitions REPLICA IDENTITY FULL;
ALTER TABLE public.tt_slots REPLICA IDENTITY FULL;