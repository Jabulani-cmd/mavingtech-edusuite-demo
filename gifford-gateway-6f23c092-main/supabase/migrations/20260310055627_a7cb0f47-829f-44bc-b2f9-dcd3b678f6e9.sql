
ALTER TABLE public.study_materials
  ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES public.classes(id),
  ADD COLUMN IF NOT EXISTS teacher_id uuid,
  ADD COLUMN IF NOT EXISTS material_type text DEFAULT 'document',
  ADD COLUMN IF NOT EXISTS link_url text,
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS expiry_date date,
  ADD COLUMN IF NOT EXISTS tags text[];
