
CREATE TABLE public.personal_timetables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  time_slot text NOT NULL,
  end_time text,
  activity text NOT NULL,
  activity_type text NOT NULL DEFAULT 'class',
  description text,
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.personal_timetables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own timetable entries"
  ON public.personal_timetables
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all personal timetables"
  ON public.personal_timetables
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
