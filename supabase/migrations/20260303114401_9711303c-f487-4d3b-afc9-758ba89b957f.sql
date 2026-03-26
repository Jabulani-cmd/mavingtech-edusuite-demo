
-- Create carousel_images table for homepage carousel
CREATE TABLE public.carousel_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;

-- Public can view active carousel images
CREATE POLICY "Anyone can view active carousel images"
  ON public.carousel_images FOR SELECT
  USING (is_active = true);

-- Admins can manage carousel images
CREATE POLICY "Admins can manage carousel images"
  ON public.carousel_images FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create gallery_images table
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  category text DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active gallery images"
  ON public.gallery_images FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage gallery images"
  ON public.gallery_images FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for school media
INSERT INTO storage.buckets (id, name, public) VALUES ('school-media', 'school-media', true);

-- Storage policies
CREATE POLICY "Anyone can view school media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'school-media');

CREATE POLICY "Admins can upload school media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'school-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete school media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'school-media' AND public.has_role(auth.uid(), 'admin'));
