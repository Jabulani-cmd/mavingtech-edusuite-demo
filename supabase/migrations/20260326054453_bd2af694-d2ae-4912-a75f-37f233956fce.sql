
-- Add RLS policies for finance_clerk role on all finance tables

CREATE POLICY "Finance clerk manage payments" ON public.payments FOR ALL TO authenticated
USING (has_role(auth.uid(), 'finance_clerk'::app_role))
WITH CHECK (has_role(auth.uid(), 'finance_clerk'::app_role));

CREATE POLICY "Finance clerk manage invoices" ON public.invoices FOR ALL TO authenticated
USING (has_role(auth.uid(), 'finance_clerk'::app_role))
WITH CHECK (has_role(auth.uid(), 'finance_clerk'::app_role));

CREATE POLICY "Finance clerk manage invoice_items" ON public.invoice_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'finance_clerk'::app_role))
WITH CHECK (has_role(auth.uid(), 'finance_clerk'::app_role));

CREATE POLICY "Finance clerk manage fee_structures" ON public.fee_structures FOR ALL TO authenticated
USING (has_role(auth.uid(), 'finance_clerk'::app_role))
WITH CHECK (has_role(auth.uid(), 'finance_clerk'::app_role));

CREATE POLICY "Finance clerk manage expenses" ON public.expenses FOR ALL TO authenticated
USING (has_role(auth.uid(), 'finance_clerk'::app_role))
WITH CHECK (has_role(auth.uid(), 'finance_clerk'::app_role));

CREATE POLICY "Finance clerk read students" ON public.students FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'finance_clerk'::app_role));

CREATE POLICY "Finance clerk manage student_restrictions" ON public.student_restrictions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'finance_clerk'::app_role))
WITH CHECK (has_role(auth.uid(), 'finance_clerk'::app_role));

CREATE POLICY "Finance clerk insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'finance_clerk'::app_role));

CREATE POLICY "Finance clerk manage bank_transactions" ON public.bank_transactions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'finance_clerk'::app_role))
WITH CHECK (has_role(auth.uid(), 'finance_clerk'::app_role));

CREATE POLICY "Finance clerk read finance_approval_requests" ON public.finance_approval_requests FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'finance_clerk'::app_role));

CREATE POLICY "Finance clerk create approval requests" ON public.finance_approval_requests FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'finance_clerk'::app_role) AND requested_by = auth.uid());
