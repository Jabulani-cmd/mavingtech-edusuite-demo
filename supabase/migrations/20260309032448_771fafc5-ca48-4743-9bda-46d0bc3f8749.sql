
CREATE TABLE public.finance_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance create approval requests"
  ON public.finance_approval_requests FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'finance'::app_role) AND requested_by = auth.uid());

CREATE POLICY "Finance read own requests"
  ON public.finance_approval_requests FOR SELECT
  USING (requested_by = auth.uid() OR has_role(auth.uid(), 'admin_supervisor'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'principal'::app_role));

CREATE POLICY "Supervisor manage approval requests"
  ON public.finance_approval_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin_supervisor'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'principal'::app_role));

-- Admin supervisor full access policies for all key tables
CREATE POLICY "Admin supervisor manage fee_structures" ON public.fee_structures FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage invoices" ON public.invoices FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage payments" ON public.payments FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage expenses" ON public.expenses FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage petty_cash" ON public.petty_cash FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage bank_transactions" ON public.bank_transactions FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage invoice_items" ON public.invoice_items FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage students" ON public.students FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage staff" ON public.staff FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage classes" ON public.classes FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage announcements" ON public.announcements FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage attendance" ON public.attendance FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage exams" ON public.exams FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage exam_results" ON public.exam_results FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage enrollments" ON public.enrollments FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage audit_logs" ON public.audit_logs FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage events" ON public.events FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage downloads" ON public.downloads FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage carousel_images" ON public.carousel_images FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage gallery_images" ON public.gallery_images FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage meetings" ON public.meetings FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage communication_logs" ON public.communication_logs FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage notifications" ON public.notifications FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage class_subjects" ON public.class_subjects FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage homework" ON public.homework FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage hostels" ON public.hostels FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage contracts" ON public.contracts FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage guardians" ON public.guardians FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage site_settings" ON public.site_settings FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage inventory_items" ON public.inventory_items FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage inventory_categories" ON public.inventory_categories FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage inventory_transactions" ON public.inventory_transactions FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage bed_allocations" ON public.bed_allocations FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage rooms" ON public.rooms FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage health_visits" ON public.health_visits FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage leave_requests" ON public.leave_requests FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage marks" ON public.marks FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage school_projects" ON public.school_projects FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));
CREATE POLICY "Admin supervisor manage facility_images" ON public.facility_images FOR ALL USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.finance_approval_requests;
