
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS questions jsonb;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS time_limit_minutes integer;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS pass_mark numeric DEFAULT 50;

ALTER TABLE public.assessment_submissions ADD COLUMN IF NOT EXISTS answers jsonb;
ALTER TABLE public.assessment_submissions ADD COLUMN IF NOT EXISTS auto_marked boolean DEFAULT false;
ALTER TABLE public.assessment_submissions ADD COLUMN IF NOT EXISTS status text DEFAULT 'submitted';
ALTER TABLE public.assessment_submissions ADD COLUMN IF NOT EXISTS submission_date timestamptz DEFAULT now();

ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_submissions;
