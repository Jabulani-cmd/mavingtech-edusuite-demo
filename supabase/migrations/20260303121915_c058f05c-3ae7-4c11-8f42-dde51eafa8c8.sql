
-- Fix storage RLS policies for school-media bucket
CREATE POLICY "Admins can upload to school-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-media' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update school-media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'school-media' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete from school-media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-media' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Anyone can read school-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'school-media');

-- Downloads table for documents like fees etc
CREATE TABLE public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage downloads"
ON public.downloads FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Anyone can view downloads"
ON public.downloads FOR SELECT
TO public
USING (true);

-- Meetings table for SGB and parent-teacher meetings
CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  meeting_date timestamptz NOT NULL,
  meeting_type text NOT NULL DEFAULT 'general',
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage meetings"
ON public.meetings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Anyone can view meetings"
ON public.meetings FOR SELECT
TO public
USING (true);
