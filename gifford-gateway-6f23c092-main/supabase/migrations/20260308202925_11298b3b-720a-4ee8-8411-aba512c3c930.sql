
-- Petty cash transactions (deposits and withdrawals)
CREATE TABLE public.petty_cash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_type TEXT NOT NULL DEFAULT 'withdrawal' CHECK (transaction_type IN ('deposit', 'withdrawal')),
  description TEXT NOT NULL,
  amount_usd NUMERIC NOT NULL DEFAULT 0,
  amount_zig NUMERIC NOT NULL DEFAULT 0,
  reference_number TEXT,
  recorded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.petty_cash ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage petty_cash" ON public.petty_cash FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Finance manage petty_cash" ON public.petty_cash FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'finance'::app_role))
  WITH CHECK (has_role(auth.uid(), 'finance'::app_role));

-- Supplier invoices / accounts payable
CREATE TABLE public.supplier_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name TEXT NOT NULL,
  supplier_contact TEXT,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  description TEXT,
  amount_usd NUMERIC NOT NULL DEFAULT 0,
  amount_zig NUMERIC NOT NULL DEFAULT 0,
  paid_usd NUMERIC NOT NULL DEFAULT 0,
  paid_zig NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid')),
  recorded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage supplier_invoices" ON public.supplier_invoices FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Finance manage supplier_invoices" ON public.supplier_invoices FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'finance'::app_role))
  WITH CHECK (has_role(auth.uid(), 'finance'::app_role));

-- Supplier payments
CREATE TABLE public.supplier_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_invoice_id UUID NOT NULL REFERENCES public.supplier_invoices(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_usd NUMERIC NOT NULL DEFAULT 0,
  amount_zig NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  reference_number TEXT,
  notes TEXT,
  recorded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage supplier_payments" ON public.supplier_payments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Finance manage supplier_payments" ON public.supplier_payments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'finance'::app_role))
  WITH CHECK (has_role(auth.uid(), 'finance'::app_role));
