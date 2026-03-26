
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'teaching';
COMMENT ON COLUMN public.staff.category IS 'Staff category: leadership, teaching, admin, general';
