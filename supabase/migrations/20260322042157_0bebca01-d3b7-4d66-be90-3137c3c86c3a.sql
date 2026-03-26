
-- Enable RLS on ALL remaining public tables that have policies
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bed_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petty_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Enable on additional tables if they exist
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='student_restrictions') THEN
    EXECUTE 'ALTER TABLE public.student_restrictions ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='student_verification_codes') THEN
    EXECUTE 'ALTER TABLE public.student_verification_codes ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='supplier_invoices') THEN
    EXECUTE 'ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='supplier_payments') THEN
    EXECUTE 'ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='term_reports') THEN
    EXECUTE 'ALTER TABLE public.term_reports ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='textbook_issues') THEN
    EXECUTE 'ALTER TABLE public.textbook_issues ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='user_blocks') THEN
    EXECUTE 'ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='user_reports') THEN
    EXECUTE 'ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- Now add missing SELECT policies for commonly needed tables

-- All authenticated users need to read classes, subjects, staff (for dropdown lists etc)
DROP POLICY IF EXISTS "Authenticated read classes" ON public.classes;
CREATE POLICY "Authenticated read classes" ON public.classes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated read subjects" ON public.subjects;
CREATE POLICY "Authenticated read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated read staff" ON public.staff;
CREATE POLICY "Authenticated read staff" ON public.staff FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated read profiles" ON public.profiles;
CREATE POLICY "Authenticated read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

-- Users update own profile
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Admin manage profiles
DROP POLICY IF EXISTS "Admin manage profiles" ON public.profiles;
CREATE POLICY "Admin manage profiles" ON public.profiles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin manage classes
DROP POLICY IF EXISTS "Admins manage classes" ON public.classes;
CREATE POLICY "Admins manage classes" ON public.classes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin supervisor manage classes" ON public.classes;
CREATE POLICY "Admin supervisor manage classes" ON public.classes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin_supervisor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin_supervisor'::app_role));

-- Admin manage subjects
DROP POLICY IF EXISTS "Admins manage subjects" ON public.subjects;
CREATE POLICY "Admins manage subjects" ON public.subjects FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin manage staff
DROP POLICY IF EXISTS "Admins manage staff" ON public.staff;
CREATE POLICY "Admins manage staff" ON public.staff FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Student_classes readable by authenticated
DROP POLICY IF EXISTS "Authenticated read student_classes" ON public.student_classes;
CREATE POLICY "Authenticated read student_classes" ON public.student_classes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage student_classes" ON public.student_classes;
CREATE POLICY "Admin manage student_classes" ON public.student_classes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Class_subjects readable by authenticated
DROP POLICY IF EXISTS "Authenticated read class_subjects" ON public.class_subjects;
CREATE POLICY "Authenticated read class_subjects" ON public.class_subjects FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage class_subjects" ON public.class_subjects;
CREATE POLICY "Admin manage class_subjects" ON public.class_subjects FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Students readable by staff
DROP POLICY IF EXISTS "Authenticated read students" ON public.students;
CREATE POLICY "Authenticated read students" ON public.students FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage students" ON public.students;
CREATE POLICY "Admin manage students" ON public.students FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enrollments readable
DROP POLICY IF EXISTS "Authenticated read enrollments" ON public.enrollments;
CREATE POLICY "Authenticated read enrollments" ON public.enrollments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage enrollments" ON public.enrollments;
CREATE POLICY "Admin manage enrollments" ON public.enrollments FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- user_roles: users read own, admins manage
DROP POLICY IF EXISTS "Users read own role" ON public.user_roles;
CREATE POLICY "Users read own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin manage user_roles" ON public.user_roles;
CREATE POLICY "Admin manage user_roles" ON public.user_roles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Events, announcements, downloads - public read
DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage events" ON public.events;
CREATE POLICY "Admin manage events" ON public.events FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Public read downloads" ON public.downloads;
CREATE POLICY "Public read downloads" ON public.downloads FOR SELECT TO authenticated USING (true);

-- Site settings, carousel, gallery, facility readable by all
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage site_settings" ON public.site_settings;
CREATE POLICY "Admin manage site_settings" ON public.site_settings FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Public read carousel_images" ON public.carousel_images;
CREATE POLICY "Public read carousel_images" ON public.carousel_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage carousel_images" ON public.carousel_images;
CREATE POLICY "Admin manage carousel_images" ON public.carousel_images FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Public read gallery_images" ON public.gallery_images;
CREATE POLICY "Public read gallery_images" ON public.gallery_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read facility_images" ON public.facility_images;
CREATE POLICY "Public read facility_images" ON public.facility_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read school_projects" ON public.school_projects;
CREATE POLICY "Public read school_projects" ON public.school_projects FOR SELECT USING (true);

-- Contact messages - public insert
DROP POLICY IF EXISTS "Public insert contact_messages" ON public.contact_messages;
CREATE POLICY "Public insert contact_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read contact_messages" ON public.contact_messages;
CREATE POLICY "Admin read contact_messages" ON public.contact_messages FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Appointments - public insert, admin manage
DROP POLICY IF EXISTS "Public insert appointments" ON public.appointments;
CREATE POLICY "Public insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage appointments" ON public.appointments;
CREATE POLICY "Admin manage appointments" ON public.appointments FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Exams - authenticated read, admin manage
DROP POLICY IF EXISTS "Authenticated read exams" ON public.exams;
CREATE POLICY "Authenticated read exams" ON public.exams FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage exams" ON public.exams;
CREATE POLICY "Admin manage exams" ON public.exams FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Exam timetable entries - authenticated read
DROP POLICY IF EXISTS "Authenticated read exam_timetable_entries" ON public.exam_timetable_entries;
CREATE POLICY "Authenticated read exam_timetable_entries" ON public.exam_timetable_entries FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage exam_timetable_entries" ON public.exam_timetable_entries;
CREATE POLICY "Admin manage exam_timetable_entries" ON public.exam_timetable_entries FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Exam results - authenticated read for teachers
DROP POLICY IF EXISTS "Authenticated read exam_results" ON public.exam_results;
CREATE POLICY "Authenticated read exam_results" ON public.exam_results FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'hod'::app_role) OR has_role(auth.uid(), 'principal'::app_role)
  OR has_role(auth.uid(), 'deputy_principal'::app_role)
);

-- Invoices/payments - finance and admin
DROP POLICY IF EXISTS "Finance read invoices" ON public.invoices;
CREATE POLICY "Finance read invoices" ON public.invoices FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)
  OR has_role(auth.uid(), 'admin_supervisor'::app_role) OR has_role(auth.uid(), 'principal'::app_role)
  OR student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  OR student_id IN (SELECT student_id FROM parent_students WHERE parent_id = auth.uid())
);

DROP POLICY IF EXISTS "Admin manage invoices" ON public.invoices;
CREATE POLICY "Admin manage invoices" ON public.invoices FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));

DROP POLICY IF EXISTS "Finance read payments" ON public.payments;
CREATE POLICY "Finance read payments" ON public.payments FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)
  OR has_role(auth.uid(), 'admin_supervisor'::app_role) OR has_role(auth.uid(), 'principal'::app_role)
  OR student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  OR student_id IN (SELECT student_id FROM parent_students WHERE parent_id = auth.uid())
);

DROP POLICY IF EXISTS "Admin manage payments" ON public.payments;
CREATE POLICY "Admin manage payments" ON public.payments FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));

-- Fee structures readable by authenticated
DROP POLICY IF EXISTS "Authenticated read fee_structures" ON public.fee_structures;
CREATE POLICY "Authenticated read fee_structures" ON public.fee_structures FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage fee_structures" ON public.fee_structures;
CREATE POLICY "Admin manage fee_structures" ON public.fee_structures FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));

-- Invoice items
DROP POLICY IF EXISTS "Authenticated read invoice_items" ON public.invoice_items;
CREATE POLICY "Authenticated read invoice_items" ON public.invoice_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage invoice_items" ON public.invoice_items;
CREATE POLICY "Admin manage invoice_items" ON public.invoice_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));

-- Guardians
DROP POLICY IF EXISTS "Authenticated read guardians" ON public.guardians;
CREATE POLICY "Authenticated read guardians" ON public.guardians FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage guardians" ON public.guardians;
CREATE POLICY "Admin manage guardians" ON public.guardians FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Parent_students
DROP POLICY IF EXISTS "Authenticated read parent_students" ON public.parent_students;
CREATE POLICY "Authenticated read parent_students" ON public.parent_students FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage parent_students" ON public.parent_students;
CREATE POLICY "Admin manage parent_students" ON public.parent_students FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Leave requests: staff manage own, HOD/principal approve
DROP POLICY IF EXISTS "Staff manage own leave" ON public.leave_requests;
CREATE POLICY "Staff manage own leave" ON public.leave_requests FOR ALL TO authenticated
USING (staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid()))
WITH CHECK (staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Management read leave" ON public.leave_requests;
CREATE POLICY "Management read leave" ON public.leave_requests FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hod'::app_role) 
  OR has_role(auth.uid(), 'principal'::app_role) OR has_role(auth.uid(), 'deputy_principal'::app_role)
);

DROP POLICY IF EXISTS "Management update leave" ON public.leave_requests;
CREATE POLICY "Management update leave" ON public.leave_requests FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hod'::app_role) 
  OR has_role(auth.uid(), 'principal'::app_role) OR has_role(auth.uid(), 'deputy_principal'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hod'::app_role) 
  OR has_role(auth.uid(), 'principal'::app_role) OR has_role(auth.uid(), 'deputy_principal'::app_role)
);

-- Conversations and messages
DROP POLICY IF EXISTS "Authenticated read conversations" ON public.conversations;
CREATE POLICY "Authenticated read conversations" ON public.conversations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated insert conversations" ON public.conversations;
CREATE POLICY "Authenticated insert conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated read messages" ON public.messages;
CREATE POLICY "Authenticated read messages" ON public.messages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated insert messages" ON public.messages;
CREATE POLICY "Authenticated insert messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated read conversation_participants" ON public.conversation_participants;
CREATE POLICY "Authenticated read conversation_participants" ON public.conversation_participants FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated insert conversation_participants" ON public.conversation_participants;
CREATE POLICY "Authenticated insert conversation_participants" ON public.conversation_participants FOR INSERT TO authenticated WITH CHECK (true);

-- Expenses, petty cash, bank transactions - finance only
DROP POLICY IF EXISTS "Finance manage expenses" ON public.expenses;
CREATE POLICY "Finance manage expenses" ON public.expenses FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));

DROP POLICY IF EXISTS "Finance manage petty_cash" ON public.petty_cash;
CREATE POLICY "Finance manage petty_cash" ON public.petty_cash FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));

DROP POLICY IF EXISTS "Finance manage bank_transactions" ON public.bank_transactions;
CREATE POLICY "Finance manage bank_transactions" ON public.bank_transactions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));

-- Contracts - admin manage
DROP POLICY IF EXISTS "Admin manage contracts" ON public.contracts;
CREATE POLICY "Admin manage contracts" ON public.contracts FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Staff read own contract" ON public.contracts;
CREATE POLICY "Staff read own contract" ON public.contracts FOR SELECT TO authenticated
USING (staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid()));

-- Health visits
DROP POLICY IF EXISTS "Admin manage health_visits" ON public.health_visits;
CREATE POLICY "Admin manage health_visits" ON public.health_visits FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Hostels, rooms, bed_allocations
DROP POLICY IF EXISTS "Authenticated read hostels" ON public.hostels;
CREATE POLICY "Authenticated read hostels" ON public.hostels FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage hostels" ON public.hostels;
CREATE POLICY "Admin manage hostels" ON public.hostels FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated read rooms" ON public.rooms;
CREATE POLICY "Authenticated read rooms" ON public.rooms FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage rooms" ON public.rooms;
CREATE POLICY "Admin manage rooms" ON public.rooms FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated read bed_allocations" ON public.bed_allocations;
CREATE POLICY "Authenticated read bed_allocations" ON public.bed_allocations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage bed_allocations" ON public.bed_allocations;
CREATE POLICY "Admin manage bed_allocations" ON public.bed_allocations FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Inventory
DROP POLICY IF EXISTS "Authenticated read inventory_items" ON public.inventory_items;
CREATE POLICY "Authenticated read inventory_items" ON public.inventory_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage inventory_items" ON public.inventory_items;
CREATE POLICY "Admin manage inventory_items" ON public.inventory_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated read inventory_categories" ON public.inventory_categories;
CREATE POLICY "Authenticated read inventory_categories" ON public.inventory_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage inventory_categories" ON public.inventory_categories;
CREATE POLICY "Admin manage inventory_categories" ON public.inventory_categories FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin manage inventory_transactions" ON public.inventory_transactions;
CREATE POLICY "Admin manage inventory_transactions" ON public.inventory_transactions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Communication logs
DROP POLICY IF EXISTS "Admin manage communication_logs" ON public.communication_logs;
CREATE POLICY "Admin manage communication_logs" ON public.communication_logs FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- SMS templates
DROP POLICY IF EXISTS "Authenticated read sms_templates" ON public.sms_templates;
CREATE POLICY "Authenticated read sms_templates" ON public.sms_templates FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage sms_templates" ON public.sms_templates;
CREATE POLICY "Admin manage sms_templates" ON public.sms_templates FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Meetings
DROP POLICY IF EXISTS "Authenticated read meetings" ON public.meetings;
CREATE POLICY "Authenticated read meetings" ON public.meetings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage meetings" ON public.meetings;
CREATE POLICY "Admin manage meetings" ON public.meetings FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Online payments
DROP POLICY IF EXISTS "Authenticated read online_payments" ON public.online_payments;
CREATE POLICY "Authenticated read online_payments" ON public.online_payments FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)
  OR student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Public insert online_payments" ON public.online_payments;
CREATE POLICY "Public insert online_payments" ON public.online_payments FOR INSERT WITH CHECK (true);

-- Finance approval requests
DROP POLICY IF EXISTS "Finance manage approval_requests" ON public.finance_approval_requests;
CREATE POLICY "Finance manage approval_requests" ON public.finance_approval_requests FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));

-- Audit logs - admin only
DROP POLICY IF EXISTS "Admin read audit_logs" ON public.audit_logs;
CREATE POLICY "Admin read audit_logs" ON public.audit_logs FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Term reports
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='term_reports') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated read term_reports" ON public.term_reports';
    EXECUTE 'CREATE POLICY "Authenticated read term_reports" ON public.term_reports FOR SELECT TO authenticated USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS "Admin manage term_reports" ON public.term_reports';
    EXECUTE 'CREATE POLICY "Admin manage term_reports" ON public.term_reports FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- Homework: teachers also need to read students' homework for marking
DROP POLICY IF EXISTS "Teachers manage own homework" ON public.homework;
CREATE POLICY "Teachers manage own homework" ON public.homework FOR ALL TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role))
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));

-- Assessment submissions readable by teachers  
DROP POLICY IF EXISTS "Teachers read all submissions" ON public.assessment_submissions;
CREATE POLICY "Teachers read all submissions" ON public.assessment_submissions FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Principal can manage most academic tables
DROP POLICY IF EXISTS "Principal manage timetable_entries" ON public.timetable_entries;
CREATE POLICY "Principal manage timetable_entries" ON public.timetable_entries FOR ALL TO authenticated
USING (has_role(auth.uid(), 'principal'::app_role)) WITH CHECK (has_role(auth.uid(), 'principal'::app_role));

-- Insert profiles (for handle_new_user trigger) - service role handles this but just in case
DROP POLICY IF EXISTS "Service insert profiles" ON public.profiles;
CREATE POLICY "Service insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
