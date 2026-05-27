ALTER TABLE public.fee_structures
  ADD COLUMN IF NOT EXISTS amount_zig numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;