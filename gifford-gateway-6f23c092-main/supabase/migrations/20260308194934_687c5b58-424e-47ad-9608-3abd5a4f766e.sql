
-- Allow finance role to manage payments (CRUD)
CREATE POLICY "Finance manage payments"
ON public.payments FOR ALL TO authenticated
USING (has_role(auth.uid(), 'finance'::app_role))
WITH CHECK (has_role(auth.uid(), 'finance'::app_role));

-- Allow finance role to manage invoices (CRUD)
CREATE POLICY "Finance manage invoices"
ON public.invoices FOR ALL TO authenticated
USING (has_role(auth.uid(), 'finance'::app_role))
WITH CHECK (has_role(auth.uid(), 'finance'::app_role));

-- Allow finance role to manage invoice_items (CRUD)
CREATE POLICY "Finance manage invoice_items"
ON public.invoice_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'finance'::app_role))
WITH CHECK (has_role(auth.uid(), 'finance'::app_role));

-- Allow finance role to manage fee_structures (CRUD)
CREATE POLICY "Finance manage fee_structures"
ON public.fee_structures FOR ALL TO authenticated
USING (has_role(auth.uid(), 'finance'::app_role))
WITH CHECK (has_role(auth.uid(), 'finance'::app_role));

-- Allow finance role to manage expenses (CRUD)
CREATE POLICY "Finance manage expenses"
ON public.expenses FOR ALL TO authenticated
USING (has_role(auth.uid(), 'finance'::app_role))
WITH CHECK (has_role(auth.uid(), 'finance'::app_role));

-- Allow finance role to read students (needed for search)
CREATE POLICY "Finance read students"
ON public.students FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'finance'::app_role));

-- Allow finance role to read student_restrictions
CREATE POLICY "Finance manage student_restrictions"
ON public.student_restrictions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'finance'::app_role))
WITH CHECK (has_role(auth.uid(), 'finance'::app_role));

-- Allow finance to insert audit logs
CREATE POLICY "Finance insert audit_logs"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'finance'::app_role));
