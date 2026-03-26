
CREATE TABLE public.online_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_type text NOT NULL DEFAULT 'fees',
  student_number text,
  student_id uuid REFERENCES public.students(id),
  project_id uuid REFERENCES public.school_projects(id),
  payer_name text NOT NULL,
  payer_email text NOT NULL,
  payer_phone text,
  amount_usd numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  status text NOT NULL DEFAULT 'pending',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.online_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create online payments"
  ON public.online_payments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read online payments"
  ON public.online_payments FOR SELECT
  USING (true);

CREATE POLICY "Admin manage online payments"
  ON public.online_payments FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'finance'::app_role) OR
    has_role(auth.uid(), 'admin_supervisor'::app_role) OR
    has_role(auth.uid(), 'principal'::app_role)
  );
