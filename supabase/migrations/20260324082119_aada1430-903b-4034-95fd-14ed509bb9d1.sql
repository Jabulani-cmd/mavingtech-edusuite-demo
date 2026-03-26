
-- Sports & Clubs schedule entries
CREATE TABLE IF NOT EXISTS public.sports_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  activity_name text NOT NULL,
  activity_type text NOT NULL DEFAULT 'sport',
  day_of_week integer NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  venue text,
  coach_id uuid REFERENCES public.staff(id),
  academic_year text DEFAULT '2026',
  term text DEFAULT 'Term 1',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sports_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage sports_schedule" ON public.sports_schedule FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated read sports_schedule" ON public.sports_schedule FOR SELECT TO authenticated USING (true);
