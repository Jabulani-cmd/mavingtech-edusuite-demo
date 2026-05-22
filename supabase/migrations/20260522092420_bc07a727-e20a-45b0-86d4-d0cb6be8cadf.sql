-- Timetable Management System schema

CREATE TABLE IF NOT EXISTS public.tt_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('class','exam')),
  class_label text,
  term text,
  academic_year text,
  start_date date,
  end_date date,
  school_days int[] DEFAULT '{1,2,3,4,5}',
  period_minutes int DEFAULT 40,
  periods_per_day int DEFAULT 8,
  day_start_time text DEFAULT '07:30',
  breaks jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  settings jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tt_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id uuid NOT NULL REFERENCES public.tt_definitions(id) ON DELETE CASCADE,
  day_of_week int NOT NULL,
  period_index int NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  is_break boolean NOT NULL DEFAULT false,
  break_label text,
  subject_name text,
  subject_color text,
  teacher_name text,
  room text,
  notes text,
  is_manual_override boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (definition_id, day_of_week, period_index)
);
CREATE INDEX IF NOT EXISTS idx_tt_slots_def ON public.tt_slots(definition_id);

CREATE TABLE IF NOT EXISTS public.tt_exam_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id uuid NOT NULL REFERENCES public.tt_definitions(id) ON DELETE CASCADE,
  exam_date date NOT NULL,
  session text NOT NULL CHECK (session IN ('morning','afternoon')),
  start_time text,
  end_time text,
  subject_name text,
  class_label text,
  venue text,
  capacity int,
  invigilator_name text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tt_exam_slots_def ON public.tt_exam_slots(definition_id);

CREATE TABLE IF NOT EXISTS public.tt_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id uuid NOT NULL REFERENCES public.tt_definitions(id) ON DELETE CASCADE,
  conflict_type text NOT NULL,
  severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('info','warning','error')),
  description text NOT NULL,
  slot_ids jsonb DEFAULT '[]'::jsonb,
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tt_conflicts_def ON public.tt_conflicts(definition_id);

CREATE TABLE IF NOT EXISTS public.ai_timetable_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id uuid REFERENCES public.tt_definitions(id) ON DELETE SET NULL,
  feature text NOT NULL,
  prompt_sent jsonb,
  response_received jsonb,
  warnings jsonb,
  conflicts_count int,
  optimization_score int,
  generation_time_ms int,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_tt_logs_def ON public.ai_timetable_logs(definition_id);

CREATE OR REPLACE FUNCTION public.tt_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_tt_definitions_updated ON public.tt_definitions;
CREATE TRIGGER trg_tt_definitions_updated
  BEFORE UPDATE ON public.tt_definitions
  FOR EACH ROW EXECUTE FUNCTION public.tt_set_updated_at();

ALTER TABLE public.tt_definitions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tt_slots            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tt_exam_slots       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tt_conflicts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_timetable_logs   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tt_def_select"   ON public.tt_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "tt_def_insert"   ON public.tt_definitions FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "tt_def_update"   ON public.tt_definitions FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "tt_def_delete"   ON public.tt_definitions FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "tt_slots_select" ON public.tt_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "tt_slots_all"    ON public.tt_slots FOR ALL    TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tt_exam_select"  ON public.tt_exam_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "tt_exam_all"     ON public.tt_exam_slots FOR ALL    TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tt_conf_select"  ON public.tt_conflicts FOR SELECT TO authenticated USING (true);
CREATE POLICY "tt_conf_all"     ON public.tt_conflicts FOR ALL    TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "ai_tt_select"    ON public.ai_timetable_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_tt_insert"    ON public.ai_timetable_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);