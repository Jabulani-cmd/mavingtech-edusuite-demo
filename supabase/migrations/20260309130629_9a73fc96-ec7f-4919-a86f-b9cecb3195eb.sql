CREATE TABLE public.student_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  code text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
  used_at timestamp with time zone,
  used_by uuid,
  UNIQUE(code)
);

ALTER TABLE public.student_verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage verification codes"
  ON public.student_verification_codes FOR ALL
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'admin_supervisor'::app_role, 'principal'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'admin_supervisor'::app_role, 'principal'::app_role]));

CREATE POLICY "Admin can view all verification codes"
  ON public.student_verification_codes FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'admin_supervisor'::app_role, 'principal'::app_role, 'registration'::app_role]));