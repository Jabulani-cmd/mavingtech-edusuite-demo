
-- Fix: Add deputy_principal to finance read policies for payments and invoices

DROP POLICY IF EXISTS "Finance read payments" ON public.payments;
CREATE POLICY "Finance read payments" ON public.payments FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)
  OR has_role(auth.uid(), 'admin_supervisor'::app_role) OR has_role(auth.uid(), 'principal'::app_role)
  OR has_role(auth.uid(), 'deputy_principal'::app_role)
  OR student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  OR student_id IN (SELECT student_id FROM parent_students WHERE parent_id = auth.uid())
);

DROP POLICY IF EXISTS "Finance read invoices" ON public.invoices;
CREATE POLICY "Finance read invoices" ON public.invoices FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)
  OR has_role(auth.uid(), 'admin_supervisor'::app_role) OR has_role(auth.uid(), 'principal'::app_role)
  OR has_role(auth.uid(), 'deputy_principal'::app_role)
  OR student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  OR student_id IN (SELECT student_id FROM parent_students WHERE parent_id = auth.uid())
);

-- Also fix the ALL policies to include deputy_principal for full management
DROP POLICY IF EXISTS "Admin manage invoices" ON public.invoices;
CREATE POLICY "Admin manage invoices" ON public.invoices FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role) OR has_role(auth.uid(), 'deputy_principal'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role) OR has_role(auth.uid(), 'deputy_principal'::app_role));

DROP POLICY IF EXISTS "Admin manage payments" ON public.payments;
CREATE POLICY "Admin manage payments" ON public.payments FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role) OR has_role(auth.uid(), 'deputy_principal'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role) OR has_role(auth.uid(), 'deputy_principal'::app_role));
