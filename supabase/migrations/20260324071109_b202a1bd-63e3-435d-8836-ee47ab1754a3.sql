
-- Term registrations table to track per-term student registration
CREATE TABLE public.term_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year text NOT NULL,
  term text NOT NULL,
  subjects text[] DEFAULT '{}',
  boarding_status text DEFAULT 'day',
  registered_by uuid,
  registered_at timestamptz NOT NULL DEFAULT now(),
  invoice_id uuid REFERENCES public.invoices(id),
  UNIQUE (student_id, academic_year, term)
);

ALTER TABLE public.term_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view term_registrations"
  ON public.term_registrations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage term_registrations"
  ON public.term_registrations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'admin_supervisor'));
