
CREATE TABLE public.school_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.school_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active school projects"
  ON public.school_projects
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage school projects"
  ON public.school_projects
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
