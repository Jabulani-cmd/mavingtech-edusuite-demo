
-- ══════════════════════════════════════════════════════════════
-- STAFF TABLE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  staff_number TEXT UNIQUE,
  full_name TEXT NOT NULL,
  title TEXT,
  role TEXT DEFAULT 'teacher',
  department TEXT,
  category TEXT DEFAULT 'teaching',
  bio TEXT,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  address TEXT,
  emergency_contact TEXT,
  employment_date DATE,
  qualifications TEXT,
  nssa_number TEXT,
  paye_number TEXT,
  bank_details TEXT,
  national_id TEXT,
  status TEXT DEFAULT 'active',
  subjects_taught TEXT[],
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view staff" ON public.staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert staff" ON public.staff FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update staff" ON public.staff FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete staff" ON public.staff FOR DELETE TO authenticated USING (true);

-- ══════════════════════════════════════════════════════════════
-- CLASSES TABLE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  form_level TEXT NOT NULL DEFAULT 'Form 1',
  stream TEXT,
  class_teacher_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  room TEXT,
  capacity INT DEFAULT 40,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert classes" ON public.classes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update classes" ON public.classes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete classes" ON public.classes FOR DELETE TO authenticated USING (true);

-- ══════════════════════════════════════════════════════════════
-- SUBJECTS TABLE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  department TEXT,
  is_examinable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert subjects" ON public.subjects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update subjects" ON public.subjects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete subjects" ON public.subjects FOR DELETE TO authenticated USING (true);

-- ══════════════════════════════════════════════════════════════
-- CLASS_SUBJECTS (assign subjects + teachers to classes)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.class_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, subject_id)
);
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage class_subjects" ON public.class_subjects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- STUDENT_CLASSES (link students to classes)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.student_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  academic_year TEXT DEFAULT '2026',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id, academic_year)
);
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage student_classes" ON public.student_classes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- ATTENDANCE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'present',
  notes TEXT,
  marked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, attendance_date)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage attendance" ON public.attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- MARKS (teacher marks for tests/assignments)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  mark NUMERIC NOT NULL,
  term TEXT NOT NULL DEFAULT 'Term 1',
  assessment_type TEXT DEFAULT 'test',
  teacher_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage marks" ON public.marks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- EXAMS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  exam_type TEXT DEFAULT 'end_of_term',
  form_level TEXT,
  term TEXT DEFAULT 'Term 1',
  academic_year TEXT DEFAULT '2026',
  start_date DATE,
  end_date DATE,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage exams" ON public.exams FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- EXAM_RESULTS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  mark NUMERIC,
  grade TEXT,
  teacher_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(exam_id, student_id, subject_id)
);
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage exam_results" ON public.exam_results FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- TIMETABLE_ENTRIES (detailed timetable)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage timetable_entries" ON public.timetable_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Legacy timetable table
CREATE TABLE public.timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage timetable" ON public.timetable FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- EXAM_TIMETABLE_ENTRIES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.exam_timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  exam_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  venue TEXT,
  form_level TEXT,
  term TEXT,
  academic_year TEXT DEFAULT '2026',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exam_timetable_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage exam_timetable" ON public.exam_timetable_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- FEE_STRUCTURES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year TEXT NOT NULL DEFAULT '2026',
  term TEXT NOT NULL DEFAULT 'Term 1',
  form TEXT NOT NULL DEFAULT 'Form 1',
  boarding_status TEXT DEFAULT 'day',
  description TEXT,
  amount_usd NUMERIC DEFAULT 0,
  amount_zig NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage fee_structures" ON public.fee_structures FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- INVOICES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  academic_year TEXT DEFAULT '2026',
  term TEXT DEFAULT 'Term 1',
  total_usd NUMERIC DEFAULT 0,
  total_zig NUMERIC DEFAULT 0,
  paid_usd NUMERIC DEFAULT 0,
  paid_zig NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'unpaid',
  due_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage invoices" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- PAYMENTS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  receipt_number TEXT,
  amount_usd NUMERIC DEFAULT 0,
  amount_zig NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'Cash',
  payment_date DATE DEFAULT CURRENT_DATE,
  reference_number TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage payments" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- EXPENSES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE DEFAULT CURRENT_DATE,
  category TEXT DEFAULT 'General',
  description TEXT,
  amount_usd NUMERIC DEFAULT 0,
  amount_zig NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'Cash',
  reference_number TEXT,
  receipt_url TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage expenses" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- PETTY_CASH
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.petty_cash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE DEFAULT CURRENT_DATE,
  transaction_type TEXT DEFAULT 'withdrawal',
  description TEXT,
  amount_usd NUMERIC DEFAULT 0,
  amount_zig NUMERIC DEFAULT 0,
  reference_number TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.petty_cash ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage petty_cash" ON public.petty_cash FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- SUPPLIER_INVOICES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.supplier_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name TEXT NOT NULL,
  supplier_contact TEXT,
  invoice_number TEXT,
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  description TEXT,
  amount_usd NUMERIC DEFAULT 0,
  amount_zig NUMERIC DEFAULT 0,
  paid_usd NUMERIC DEFAULT 0,
  paid_zig NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'unpaid',
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage supplier_invoices" ON public.supplier_invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- SUPPLIER_PAYMENTS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.supplier_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_invoice_id UUID REFERENCES public.supplier_invoices(id) ON DELETE CASCADE NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  amount_usd NUMERIC DEFAULT 0,
  amount_zig NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'Cash',
  reference_number TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage supplier_payments" ON public.supplier_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- FINANCE_APPROVAL_REQUESTS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.finance_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.finance_approval_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage finance_approvals" ON public.finance_approval_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- BANK_TRANSACTIONS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE NOT NULL,
  description TEXT,
  debit NUMERIC DEFAULT 0,
  credit NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  reference TEXT,
  is_reconciled BOOLEAN DEFAULT false,
  matched_payment_id UUID,
  matched_expense_id UUID,
  imported_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage bank_transactions" ON public.bank_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- ANNOUNCEMENTS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  is_public BOOLEAN DEFAULT true,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_audience TEXT,
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage announcements" ON public.announcements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- CAROUSEL_IMAGES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.carousel_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view carousel" ON public.carousel_images FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage carousel" ON public.carousel_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- GALLERY_IMAGES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view gallery" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage gallery" ON public.gallery_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- DOWNLOADS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  file_type TEXT,
  file_size TEXT,
  download_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view downloads" ON public.downloads FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage downloads" ON public.downloads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- MEETINGS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  meeting_date DATE,
  time TEXT,
  venue TEXT,
  target_audience TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view meetings" ON public.meetings FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage meetings" ON public.meetings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- MESSAGES (for messaging panel)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own received messages" ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = recipient_id);

-- ══════════════════════════════════════════════════════════════
-- SITE_SETTINGS (key-value for site config)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage site_settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- STUDY_MATERIALS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  form_level TEXT,
  term TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  download_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage study_materials" ON public.study_materials FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- LEAVE_REQUESTS (staff)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage leave_requests" ON public.leave_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- PARENT_STUDENTS (link parents to students)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL,
  relationship TEXT DEFAULT 'parent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_id, student_id)
);
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own links" ON public.parent_students FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "Authenticated can insert parent_students" ON public.parent_students FOR INSERT TO authenticated WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- VERIFICATION_CODES (for parent-student linking)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  is_used BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage verification_codes" ON public.verification_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- SCHOOL_PROJECTS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.school_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  target_amount NUMERIC DEFAULT 0,
  raised_amount NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.school_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view projects" ON public.school_projects FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage projects" ON public.school_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- HOSTELS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.hostels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  total_capacity INT DEFAULT 0,
  current_occupancy INT DEFAULT 0,
  housemaster_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  assistant_housemaster_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  phone TEXT,
  location TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage hostels" ON public.hostels FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- ROOMS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID REFERENCES public.hostels(id) ON DELETE CASCADE NOT NULL,
  room_number TEXT NOT NULL,
  room_type TEXT DEFAULT 'dormitory',
  capacity INT DEFAULT 1,
  current_occupancy INT DEFAULT 0,
  floor INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage rooms" ON public.rooms FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- BED_ALLOCATIONS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.bed_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL,
  bed_number TEXT,
  allocation_start_date DATE DEFAULT CURRENT_DATE,
  allocation_end_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bed_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage bed_allocations" ON public.bed_allocations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- HEALTH_VISITS (boarding)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.health_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  visit_date DATE DEFAULT CURRENT_DATE,
  symptoms TEXT,
  diagnosis TEXT,
  treatment TEXT,
  medication_given TEXT,
  follow_up_date DATE,
  visited_by TEXT,
  notes TEXT,
  parent_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage health_visits" ON public.health_visits FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- INVENTORY_CATEGORIES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage inventory_categories" ON public.inventory_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- INVENTORY_ITEMS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  item_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity INT DEFAULT 0,
  unit TEXT DEFAULT 'piece',
  reorder_level INT,
  location TEXT,
  supplier TEXT,
  supplier_contact TEXT,
  purchase_price_usd NUMERIC,
  purchase_price_zig NUMERIC,
  barcode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage inventory_items" ON public.inventory_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- INVENTORY_TRANSACTIONS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL,
  quantity INT NOT NULL,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage inventory_transactions" ON public.inventory_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- TEXTBOOK_ISSUES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.textbook_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  condition_on_issue TEXT,
  condition_on_return TEXT,
  fine_amount_usd NUMERIC,
  fine_amount_zig NUMERIC,
  status TEXT DEFAULT 'issued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.textbook_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage textbook_issues" ON public.textbook_issues FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- FACILITY_IMAGES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.facility_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  facility_type TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.facility_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view facility_images" ON public.facility_images FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage facility_images" ON public.facility_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- TERM_REPORTS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.term_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
  term TEXT,
  academic_year TEXT,
  form_level TEXT,
  class_teacher_comment TEXT,
  head_comment TEXT,
  conduct TEXT,
  attendance_percentage NUMERIC,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.term_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage term_reports" ON public.term_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- AUDIT_LOGS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage audit_logs" ON public.audit_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- COMMUNICATION_TEMPLATES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_text TEXT NOT NULL,
  variables TEXT[],
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage communication_templates" ON public.communication_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- COMMUNICATION_LOGS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type TEXT,
  recipient_ids TEXT[],
  recipient_count INT DEFAULT 0,
  message TEXT NOT NULL,
  subject TEXT,
  channel TEXT DEFAULT 'notification',
  status TEXT DEFAULT 'sent',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.communication_templates(id) ON DELETE SET NULL,
  reference TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage communication_logs" ON public.communication_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- ADD MISSING COLUMNS TO STUDENTS TABLE
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS form TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject_combination TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS has_medical_alert BOOLEAN DEFAULT false;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS enrollment_date DATE;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS sports_activities TEXT[];

-- ══════════════════════════════════════════════════════════════
-- STORAGE BUCKET for school media
-- ══════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public) VALUES ('school-media', 'school-media', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Anyone can view school-media" ON storage.objects FOR SELECT USING (bucket_id = 'school-media');
CREATE POLICY "Authenticated can upload school-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'school-media');
CREATE POLICY "Authenticated can update school-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'school-media');
CREATE POLICY "Authenticated can delete school-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'school-media');

-- ══════════════════════════════════════════════════════════════
-- UPDATE TRIGGERS
-- ══════════════════════════════════════════════════════════════
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fee_structures_updated_at BEFORE UPDATE ON public.fee_structures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplier_invoices_updated_at BEFORE UPDATE ON public.supplier_invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_school_projects_updated_at BEFORE UPDATE ON public.school_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_term_reports_updated_at BEFORE UPDATE ON public.term_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_finance_approvals_updated_at BEFORE UPDATE ON public.finance_approval_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
