ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS recorded_by uuid;
NOTIFY pgrst, 'reload schema';