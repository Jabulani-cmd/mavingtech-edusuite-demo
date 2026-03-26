
-- Add RLS policies for bursar role on all finance tables

CREATE POLICY "Bursar manage payments" ON public.payments FOR ALL TO authenticated
USING (has_role(auth.uid(), 'bursar'::app_role))
WITH CHECK (has_role(auth.uid(), 'bursar'::app_role));

CREATE POLICY "Bursar manage invoices" ON public.invoices FOR ALL TO authenticated
USING (has_role(auth.uid(), 'bursar'::app_role))
WITH CHECK (has_role(auth.uid(), 'bursar'::app_role));

CREATE POLICY "Bursar manage invoice_items" ON public.invoice_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'bursar'::app_role))
WITH CHECK (has_role(auth.uid(), 'bursar'::app_role));

CREATE POLICY "Bursar manage fee_structures" ON public.fee_structures FOR ALL TO authenticated
USING (has_role(auth.uid(), 'bursar'::app_role))
WITH CHECK (has_role(auth.uid(), 'bursar'::app_role));

CREATE POLICY "Bursar manage expenses" ON public.expenses FOR ALL TO authenticated
USING (has_role(auth.uid(), 'bursar'::app_role))
WITH CHECK (has_role(auth.uid(), 'bursar'::app_role));

CREATE POLICY "Bursar read students" ON public.students FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'bursar'::app_role));

CREATE POLICY "Bursar manage student_restrictions" ON public.student_restrictions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'bursar'::app_role))
WITH CHECK (has_role(auth.uid(), 'bursar'::app_role));

CREATE POLICY "Bursar insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'bursar'::app_role));

CREATE POLICY "Bursar manage bank_transactions" ON public.bank_transactions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'bursar'::app_role))
WITH CHECK (has_role(auth.uid(), 'bursar'::app_role));

CREATE POLICY "Bursar read finance_approval_requests" ON public.finance_approval_requests FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'bursar'::app_role));

CREATE POLICY "Bursar create approval requests" ON public.finance_approval_requests FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'bursar'::app_role) AND requested_by = auth.uid());

-- Ensure HOD can read attendance, exam results, and exams
CREATE POLICY "HOD read attendance" ON public.attendance FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'hod'::app_role));

CREATE POLICY "HOD read exam_results" ON public.exam_results FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'hod'::app_role));

CREATE POLICY "HOD read exams" ON public.exams FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'hod'::app_role));
