
-- Table to store verification codes for linking parents to students
CREATE TABLE public.student_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamptz,
  used_by uuid,
  UNIQUE(student_id, code)
);

ALTER TABLE public.student_verification_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can manage verification codes
CREATE POLICY "Admins manage verification codes"
  ON public.student_verification_codes
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
