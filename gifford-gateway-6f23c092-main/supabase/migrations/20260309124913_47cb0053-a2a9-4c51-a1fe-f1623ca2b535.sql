
-- ══════════════════════════════════════════════════════════════
-- SECURITY DEFINER HELPER: check if user has any of given roles
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles)
  );
$$;

-- Helper: get user's role text
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$$;

-- ══════════════════════════════════════════════════════════════
-- Define role groups for convenience
-- admin_roles: admin, admin_supervisor, principal, deputy_principal
-- academic_roles: teacher, hod + admin_roles
-- finance_roles: finance + admin_roles
-- ══════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════
-- STAFF TABLE — only admin roles can write; all authenticated can read
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can view staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated can insert staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated can update staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated can delete staff" ON public.staff;

CREATE POLICY "Authenticated can view staff" ON public.staff
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin roles can insert staff" ON public.staff
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));
CREATE POLICY "Admin roles can update staff" ON public.staff
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));
CREATE POLICY "Admin roles can delete staff" ON public.staff
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- CLASSES — admin/academic roles can write; all can read
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can view classes" ON public.classes;
DROP POLICY IF EXISTS "Authenticated can insert classes" ON public.classes;
DROP POLICY IF EXISTS "Authenticated can update classes" ON public.classes;
DROP POLICY IF EXISTS "Authenticated can delete classes" ON public.classes;

CREATE POLICY "Authenticated can view classes" ON public.classes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Academic roles can insert classes" ON public.classes
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]));
CREATE POLICY "Academic roles can update classes" ON public.classes
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]));
CREATE POLICY "Academic roles can delete classes" ON public.classes
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- SUBJECTS — admin/academic roles can write; all can read
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can view subjects" ON public.subjects;
DROP POLICY IF EXISTS "Authenticated can insert subjects" ON public.subjects;
DROP POLICY IF EXISTS "Authenticated can update subjects" ON public.subjects;
DROP POLICY IF EXISTS "Authenticated can delete subjects" ON public.subjects;

CREATE POLICY "Authenticated can view subjects" ON public.subjects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Academic roles can insert subjects" ON public.subjects
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]));
CREATE POLICY "Academic roles can update subjects" ON public.subjects
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]));
CREATE POLICY "Academic roles can delete subjects" ON public.subjects
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- CLASS_SUBJECTS — academic roles can write
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage class_subjects" ON public.class_subjects;

CREATE POLICY "Authenticated can view class_subjects" ON public.class_subjects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Academic roles can manage class_subjects" ON public.class_subjects
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- STUDENT_CLASSES — admin/academic can write
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage student_classes" ON public.student_classes;

CREATE POLICY "Authenticated can view student_classes" ON public.student_classes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Academic roles can manage student_classes" ON public.student_classes
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher','registration']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher','registration']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- STUDENTS — admin/registration can write; teachers can read; students see own
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can insert students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can update students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can delete students" ON public.students;

CREATE POLICY "Staff can view students" ON public.students
  FOR SELECT TO authenticated
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher','finance','registration']::app_role[])
    OR user_id = auth.uid()
  );
CREATE POLICY "Admin roles can insert students" ON public.students
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','registration']::app_role[]));
CREATE POLICY "Admin roles can update students" ON public.students
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','registration']::app_role[]));
CREATE POLICY "Admin roles can delete students" ON public.students
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- ATTENDANCE — teachers/admin can write; students see own
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage attendance" ON public.attendance;

CREATE POLICY "Staff can view attendance" ON public.attendance
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can manage attendance" ON public.attendance
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));
CREATE POLICY "Teachers can update attendance" ON public.attendance
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));
CREATE POLICY "Admin can delete attendance" ON public.attendance
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- MARKS — teachers can write; all authenticated can read
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage marks" ON public.marks;

CREATE POLICY "Authenticated can view marks" ON public.marks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can insert marks" ON public.marks
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));
CREATE POLICY "Teachers can update marks" ON public.marks
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));
CREATE POLICY "Admin can delete marks" ON public.marks
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- EXAMS — academic roles manage; all can read
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage exams" ON public.exams;

CREATE POLICY "Authenticated can view exams" ON public.exams
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Academic roles can manage exams" ON public.exams
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));
CREATE POLICY "Academic roles can update exams" ON public.exams
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));
CREATE POLICY "Admin can delete exams" ON public.exams
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- EXAM_RESULTS — teachers can write; all can read
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage exam_results" ON public.exam_results;

CREATE POLICY "Authenticated can view exam_results" ON public.exam_results
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can insert exam_results" ON public.exam_results
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));
CREATE POLICY "Teachers can update exam_results" ON public.exam_results
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));
CREATE POLICY "Admin can delete exam_results" ON public.exam_results
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- TIMETABLE_ENTRIES — academic roles manage
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage timetable_entries" ON public.timetable_entries;

CREATE POLICY "Authenticated can view timetable_entries" ON public.timetable_entries
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Academic roles can manage timetable_entries" ON public.timetable_entries
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]));

DROP POLICY IF EXISTS "Authenticated can manage timetable" ON public.timetable;

CREATE POLICY "Authenticated can view timetable" ON public.timetable
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Academic roles can manage timetable" ON public.timetable
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- EXAM_TIMETABLE_ENTRIES
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage exam_timetable" ON public.exam_timetable_entries;

CREATE POLICY "Authenticated can view exam_timetable" ON public.exam_timetable_entries
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Academic roles can manage exam_timetable" ON public.exam_timetable_entries
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- FINANCE TABLES — finance + admin roles only
-- ══════════════════════════════════════════════════════════════

-- FEE_STRUCTURES
DROP POLICY IF EXISTS "Authenticated can manage fee_structures" ON public.fee_structures;
CREATE POLICY "Authenticated can view fee_structures" ON public.fee_structures
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Finance roles can manage fee_structures" ON public.fee_structures
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]));

-- INVOICES
DROP POLICY IF EXISTS "Authenticated can manage invoices" ON public.invoices;
CREATE POLICY "Authenticated can view invoices" ON public.invoices
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Finance roles can manage invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]));

-- PAYMENTS
DROP POLICY IF EXISTS "Authenticated can manage payments" ON public.payments;
CREATE POLICY "Authenticated can view payments" ON public.payments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Finance roles can manage payments" ON public.payments
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]));

-- EXPENSES
DROP POLICY IF EXISTS "Authenticated can manage expenses" ON public.expenses;
CREATE POLICY "Authenticated can view expenses" ON public.expenses
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]));
CREATE POLICY "Finance roles can manage expenses" ON public.expenses
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]));

-- PETTY_CASH
DROP POLICY IF EXISTS "Authenticated can manage petty_cash" ON public.petty_cash;
CREATE POLICY "Finance can view petty_cash" ON public.petty_cash
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]));
CREATE POLICY "Finance roles can manage petty_cash" ON public.petty_cash
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]));

-- SUPPLIER_INVOICES
DROP POLICY IF EXISTS "Authenticated can manage supplier_invoices" ON public.supplier_invoices;
CREATE POLICY "Finance can view supplier_invoices" ON public.supplier_invoices
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]));
CREATE POLICY "Finance roles can manage supplier_invoices" ON public.supplier_invoices
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]));

-- SUPPLIER_PAYMENTS
DROP POLICY IF EXISTS "Authenticated can manage supplier_payments" ON public.supplier_payments;
CREATE POLICY "Finance can view supplier_payments" ON public.supplier_payments
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]));
CREATE POLICY "Finance roles can manage supplier_payments" ON public.supplier_payments
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]));

-- BANK_TRANSACTIONS
DROP POLICY IF EXISTS "Authenticated can manage bank_transactions" ON public.bank_transactions;
CREATE POLICY "Finance can view bank_transactions" ON public.bank_transactions
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]));
CREATE POLICY "Finance roles can manage bank_transactions" ON public.bank_transactions
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]));

-- FINANCE_APPROVAL_REQUESTS
DROP POLICY IF EXISTS "Authenticated can manage finance_approvals" ON public.finance_approval_requests;
CREATE POLICY "Finance can view approvals" ON public.finance_approval_requests
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]) OR requested_by = auth.uid());
CREATE POLICY "Finance can insert approvals" ON public.finance_approval_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','finance']::app_role[]));
CREATE POLICY "Admin supervisor can update approvals" ON public.finance_approval_requests
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- ANNOUNCEMENTS — admin can write; public can read
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage announcements" ON public.announcements;

CREATE POLICY "Anyone can view announcements" ON public.announcements
  FOR SELECT USING (true);
CREATE POLICY "Admin roles can manage announcements" ON public.announcements
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));
CREATE POLICY "Admin roles can update announcements" ON public.announcements
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));
CREATE POLICY "Admin roles can delete announcements" ON public.announcements
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- LEAVE_REQUESTS — staff can insert own; admin can manage all
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage leave_requests" ON public.leave_requests;

CREATE POLICY "Staff can view leave_requests" ON public.leave_requests
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert leave_requests" ON public.leave_requests
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can update leave_requests" ON public.leave_requests
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod']::app_role[]));
CREATE POLICY "Admin can delete leave_requests" ON public.leave_requests
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- STUDY_MATERIALS — teachers can write; students can read
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage study_materials" ON public.study_materials;

CREATE POLICY "Authenticated can view study_materials" ON public.study_materials
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can manage study_materials" ON public.study_materials
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));
CREATE POLICY "Teachers can update study_materials" ON public.study_materials
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));
CREATE POLICY "Admin can delete study_materials" ON public.study_materials
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- TERM_REPORTS — academic roles manage
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage term_reports" ON public.term_reports;

CREATE POLICY "Authenticated can view term_reports" ON public.term_reports
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Academic roles can manage term_reports" ON public.term_reports
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal','hod','teacher']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- AUDIT_LOGS — admin only
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage audit_logs" ON public.audit_logs;

CREATE POLICY "Admin can view audit_logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal']::app_role[]));
CREATE POLICY "System can insert audit_logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- BOARDING TABLES — admin roles manage
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage hostels" ON public.hostels;
CREATE POLICY "Authenticated can view hostels" ON public.hostels
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin roles can manage hostels" ON public.hostels
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));

DROP POLICY IF EXISTS "Authenticated can manage rooms" ON public.rooms;
CREATE POLICY "Authenticated can view rooms" ON public.rooms
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin roles can manage rooms" ON public.rooms
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));

DROP POLICY IF EXISTS "Authenticated can manage bed_allocations" ON public.bed_allocations;
CREATE POLICY "Authenticated can view bed_allocations" ON public.bed_allocations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin roles can manage bed_allocations" ON public.bed_allocations
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));

DROP POLICY IF EXISTS "Authenticated can manage health_visits" ON public.health_visits;
CREATE POLICY "Authenticated can view health_visits" ON public.health_visits
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin roles can manage health_visits" ON public.health_visits
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- INVENTORY TABLES — admin roles manage
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage inventory_categories" ON public.inventory_categories;
CREATE POLICY "Authenticated can view inventory_categories" ON public.inventory_categories
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin roles can manage inventory_categories" ON public.inventory_categories
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal']::app_role[]));

DROP POLICY IF EXISTS "Authenticated can manage inventory_items" ON public.inventory_items;
CREATE POLICY "Authenticated can view inventory_items" ON public.inventory_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin roles can manage inventory_items" ON public.inventory_items
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal']::app_role[]));

DROP POLICY IF EXISTS "Authenticated can manage inventory_transactions" ON public.inventory_transactions;
CREATE POLICY "Authenticated can view inventory_transactions" ON public.inventory_transactions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin roles can manage inventory_transactions" ON public.inventory_transactions
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal']::app_role[]));

DROP POLICY IF EXISTS "Authenticated can manage textbook_issues" ON public.textbook_issues;
CREATE POLICY "Authenticated can view textbook_issues" ON public.textbook_issues
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin roles can manage textbook_issues" ON public.textbook_issues
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','teacher']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','teacher']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- COMMUNICATION TABLES
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage communication_templates" ON public.communication_templates;
CREATE POLICY "Authenticated can view communication_templates" ON public.communication_templates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin roles can manage communication_templates" ON public.communication_templates
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));

DROP POLICY IF EXISTS "Authenticated can manage communication_logs" ON public.communication_logs;
CREATE POLICY "Admin can view communication_logs" ON public.communication_logs
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));
CREATE POLICY "Admin roles can manage communication_logs" ON public.communication_logs
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','deputy_principal']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- VERIFICATION_CODES — admin manage
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can manage verification_codes" ON public.verification_codes;
CREATE POLICY "Admin can view verification_codes" ON public.verification_codes
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','registration']::app_role[]) OR created_by = auth.uid());
CREATE POLICY "Admin can insert verification_codes" ON public.verification_codes
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal','registration']::app_role[]));
CREATE POLICY "Admin can update verification_codes" ON public.verification_codes
  FOR UPDATE TO authenticated
  USING (true);

-- ══════════════════════════════════════════════════════════════
-- PARENT_STUDENTS — parents see own; admin manage
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Users can view own links" ON public.parent_students;
DROP POLICY IF EXISTS "Authenticated can insert parent_students" ON public.parent_students;

CREATE POLICY "Users can view own parent links" ON public.parent_students
  FOR SELECT TO authenticated
  USING (auth.uid() = parent_id OR public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal']::app_role[]));
CREATE POLICY "System can insert parent_students" ON public.parent_students
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can delete parent_students" ON public.parent_students
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal']::app_role[]));

-- ══════════════════════════════════════════════════════════════
-- USER_ROLES — admin only can manage; users see own
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "Admin can insert user_roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal']::app_role[]));
CREATE POLICY "Admin can update user_roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal']::app_role[]));
CREATE POLICY "Admin can delete user_roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','admin_supervisor','principal']::app_role[]));
