
CREATE TABLE public.facility_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  facility_type text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.facility_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active facility images" ON public.facility_images FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage facility images" ON public.facility_images FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
