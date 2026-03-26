
-- Bank transactions for reconciliation
CREATE TABLE public.bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  reference_number TEXT,
  transaction_type TEXT NOT NULL DEFAULT 'credit' CHECK (transaction_type IN ('credit', 'debit')),
  amount_usd NUMERIC NOT NULL DEFAULT 0,
  amount_zig NUMERIC NOT NULL DEFAULT 0,
  bank_name TEXT,
  account_number TEXT,
  reconciliation_status TEXT NOT NULL DEFAULT 'unreconciled' CHECK (reconciliation_status IN ('unreconciled', 'reconciled', 'disputed')),
  matched_payment_id UUID,
  matched_expense_id UUID,
  matched_supplier_payment_id UUID,
  notes TEXT,
  recorded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage bank_transactions" ON public.bank_transactions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Finance manage bank_transactions" ON public.bank_transactions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'finance'::app_role))
  WITH CHECK (has_role(auth.uid(), 'finance'::app_role));
