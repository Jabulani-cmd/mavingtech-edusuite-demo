
-- Fee Structures table
CREATE TABLE public.fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year text NOT NULL,
  term text NOT NULL,
  form text NOT NULL,
  boarding_status text NOT NULL DEFAULT 'day',
  description text,
  amount_usd numeric(12,2) NOT NULL DEFAULT 0,
  amount_zig numeric(12,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year text NOT NULL,
  term text NOT NULL,
  total_usd numeric(12,2) NOT NULL DEFAULT 0,
  total_zig numeric(12,2) NOT NULL DEFAULT 0,
  paid_usd numeric(12,2) NOT NULL DEFAULT 0,
  paid_zig numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'unpaid',
  due_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text NOT NULL UNIQUE,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount_usd numeric(12,2) NOT NULL DEFAULT 0,
  amount_zig numeric(12,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash',
  reference_number text,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  recorded_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Expenses table
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL DEFAULT 'general',
  description text NOT NULL,
  amount_usd numeric(12,2) NOT NULL DEFAULT 0,
  amount_zig numeric(12,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash',
  reference_number text,
  receipt_url text,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Invoice line items for fee breakdown
CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  fee_structure_id uuid REFERENCES public.fee_structures(id),
  description text NOT NULL,
  amount_usd numeric(12,2) NOT NULL DEFAULT 0,
  amount_zig numeric(12,2) NOT NULL DEFAULT 0
);

-- Student restrictions for debtors
CREATE TABLE public.student_restrictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  restriction_type text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  applied_by uuid,
  applied_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz
);

-- RLS for all tables
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_restrictions ENABLE ROW LEVEL SECURITY;

-- Fee structures: admins manage, authenticated read
CREATE POLICY "Admins manage fee_structures" ON public.fee_structures FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated read fee_structures" ON public.fee_structures FOR SELECT TO authenticated USING (true);

-- Invoices: admins manage, students view own
CREATE POLICY "Admins manage invoices" ON public.invoices FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Students view own invoices" ON public.invoices FOR SELECT TO authenticated USING (student_id IN (SELECT s.id FROM public.students s WHERE s.user_id = auth.uid()));

-- Payments: admins manage, students view own
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Students view own payments" ON public.payments FOR SELECT TO authenticated USING (student_id IN (SELECT s.id FROM public.students s WHERE s.user_id = auth.uid()));

-- Expenses: admins only
CREATE POLICY "Admins manage expenses" ON public.expenses FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Invoice items: admins manage, students view own
CREATE POLICY "Admins manage invoice_items" ON public.invoice_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Students view own invoice_items" ON public.invoice_items FOR SELECT TO authenticated USING (invoice_id IN (SELECT i.id FROM public.invoices i JOIN public.students s ON i.student_id = s.id WHERE s.user_id = auth.uid()));

-- Student restrictions: admins only
CREATE POLICY "Admins manage student_restrictions" ON public.student_restrictions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
