
-- Awards/prize-giving records
CREATE TABLE public.awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  award_name TEXT NOT NULL,
  year_issued INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now())::integer,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Award/prize-giving photos
CREATE TABLE public.award_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- RLS
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_photos ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view awards" ON public.awards FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can view award_photos" ON public.award_photos FOR SELECT TO public USING (true);

-- Admin manage
CREATE POLICY "Admin roles can manage awards" ON public.awards FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'admin_supervisor'::app_role, 'principal'::app_role, 'deputy_principal'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'admin_supervisor'::app_role, 'principal'::app_role, 'deputy_principal'::app_role]));

CREATE POLICY "Admin roles can manage award_photos" ON public.award_photos FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'admin_supervisor'::app_role, 'principal'::app_role, 'deputy_principal'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'admin_supervisor'::app_role, 'principal'::app_role, 'deputy_principal'::app_role]));
