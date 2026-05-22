-- ============================================
-- CORE SCHOOL MANAGEMENT SCHEMA (catch-up migration)
-- All tables idempotent; permissive enough for admin demo
-- ============================================

-- Helper: has_any_role (used by many policies)
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles));
$$;

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ============================================
-- IDENTITY / PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  user_id uuid UNIQUE,
  full_name text DEFAULT '',
  email text,
  phone text,
  avatar_url text,
  grade text,
  class_name text,
  role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STUDENTS
-- ============================================
CREATE SEQUENCE IF NOT EXISTS public.student_number_seq START WITH 1001;
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_number text UNIQUE,
  user_id uuid,
  full_name text NOT NULL DEFAULT '',
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  email text,
  date_of_birth date,
  gender text,
  class text,
  stream text,
  form text,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  emergency_contact text,
  address text,
  photo_url text,
  boarding_status text DEFAULT 'day',
  sports_activities text[] DEFAULT '{}',
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STAFF
-- ============================================
CREATE SEQUENCE IF NOT EXISTS public.staff_number_seq START WITH 1;
CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_number text UNIQUE,
  user_id uuid,
  full_name text NOT NULL,
  title text,
  department text,
  category text NOT NULL DEFAULT 'teaching',
  email text,
  phone text,
  bio text,
  photo_url text,
  qualifications text,
  date_joined date,
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Public-safe view (no email/phone)
CREATE OR REPLACE VIEW public.staff_public WITH (security_invoker=on) AS
  SELECT id, full_name, title, department, category, bio, photo_url, qualifications FROM public.staff;

-- ============================================
-- ACADEMIC STRUCTURE
-- ============================================
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level text,
  stream text,
  capacity integer,
  class_teacher_id uuid,
  academic_year text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  department text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.class_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(class_id, subject_id)
);
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year text,
  term text,
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.student_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ATTENDANCE / MARKS / ASSESSMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'present',
  notes text,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id),
  teacher_id uuid,
  class_id uuid REFERENCES public.classes(id),
  assessment_type text NOT NULL DEFAULT 'test',
  mark numeric NOT NULL DEFAULT 0,
  out_of numeric DEFAULT 100,
  term text NOT NULL DEFAULT 'Term 1',
  academic_year text,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  term text,
  academic_year text,
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id),
  mark numeric,
  grade text,
  comment text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.exam_timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id),
  class_id uuid REFERENCES public.classes(id),
  exam_date date NOT NULL,
  start_time text,
  end_time text,
  venue text,
  invigilator text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.exam_timetable_entries ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  class_id uuid REFERENCES public.classes(id),
  subject_id uuid REFERENCES public.subjects(id),
  teacher_id uuid,
  assessment_type text DEFAULT 'quiz',
  due_date date,
  total_marks numeric DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  mark numeric,
  feedback text,
  graded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.assessment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  submission_url text,
  notes text,
  submitted_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TIMETABLE EXTRAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id),
  teacher_id uuid,
  day_of_week integer NOT NULL,
  start_time text,
  end_time text,
  room text,
  term text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.personal_timetables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.personal_timetables ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TEACHING CONTENT
-- ============================================
CREATE TABLE IF NOT EXISTS public.homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id),
  teacher_id uuid,
  title text NOT NULL,
  description text,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.lesson_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid,
  subject_id uuid REFERENCES public.subjects(id),
  class_id uuid REFERENCES public.classes(id),
  title text NOT NULL,
  content text,
  week_number integer,
  term text,
  academic_year text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.study_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid,
  title text NOT NULL,
  description text,
  class_id uuid REFERENCES public.classes(id),
  subject_id uuid REFERENCES public.subjects(id),
  material_type text NOT NULL DEFAULT 'document',
  file_url text,
  link_url text,
  is_published boolean NOT NULL DEFAULT true,
  download_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.teacher_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid,
  title text NOT NULL,
  description text,
  resource_type text DEFAULT 'document',
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.teacher_resources ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COMMUNICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  author_id uuid,
  category text DEFAULT 'general',
  target_type text DEFAULT 'whole_school',
  target_ids text[],
  file_attachments text[],
  is_public boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  last_read_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.communication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  recipient text,
  channel text DEFAULT 'sms',
  subject text,
  body text,
  status text DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.parent_communication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid,
  parent_id uuid,
  student_id uuid,
  subject text,
  message text,
  channel text DEFAULT 'message',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.parent_communication_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  body text NOT NULL,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SCHEDULING
-- ============================================
CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  meeting_date timestamptz NOT NULL,
  meeting_type text NOT NULL DEFAULT 'general',
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid,
  parent_id uuid,
  student_id uuid,
  appointment_date timestamptz NOT NULL,
  notes text,
  status text DEFAULT 'requested',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_type text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- WEBSITE CONTENT
-- ============================================
CREATE TABLE IF NOT EXISTS public.carousel_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  category text DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.facility_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid,
  image_url text NOT NULL,
  caption text,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.facility_images ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  capacity integer,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  year integer,
  recipient text,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.award_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id uuid REFERENCES public.awards(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.award_photos ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.school_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  goal_amount numeric DEFAULT 0,
  raised_amount numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.school_projects ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.sports_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport text NOT NULL,
  event_date date NOT NULL,
  opponent text,
  venue text,
  result text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sports_schedule ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARENT / ACCESS
-- ============================================
CREATE TABLE IF NOT EXISTS public.parent_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  student_id uuid NOT NULL,
  relationship text DEFAULT 'parent',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(parent_id, student_id)
);
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.parent_student_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  student_id uuid NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.student_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  used_at timestamptz,
  used_by uuid
);
ALTER TABLE public.student_verification_codes ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_user_id uuid NOT NULL,
  reason text,
  blocked_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid,
  reported_user_id uuid,
  reason text,
  status text DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FINANCE / REGISTRATION
-- ============================================
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form text NOT NULL,
  term text NOT NULL,
  academic_year text NOT NULL,
  boarding_status text DEFAULT 'day',
  amount_usd numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  amount_usd numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  term text,
  academic_year text,
  status text DEFAULT 'pending',
  due_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text,
  description text NOT NULL,
  amount_usd numeric NOT NULL DEFAULT 0,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  recorded_by uuid,
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.petty_cash (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount_usd numeric NOT NULL DEFAULT 0,
  transaction_type text DEFAULT 'expense',
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.petty_cash ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  reference_number text,
  transaction_type text NOT NULL DEFAULT 'credit',
  amount_usd numeric NOT NULL DEFAULT 0,
  amount_zig numeric NOT NULL DEFAULT 0,
  bank_name text,
  account_number text,
  reconciliation_status text NOT NULL DEFAULT 'unreconciled',
  matched_payment_id uuid,
  matched_expense_id uuid,
  matched_supplier_payment_id uuid,
  notes text,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.supplier_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name text NOT NULL,
  invoice_number text,
  amount_usd numeric NOT NULL DEFAULT 0,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.supplier_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_invoice_id uuid REFERENCES public.supplier_invoices(id) ON DELETE SET NULL,
  amount_usd numeric NOT NULL DEFAULT 0,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text,
  reference text,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.finance_approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid,
  request_type text NOT NULL,
  amount_usd numeric DEFAULT 0,
  description text,
  status text DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.finance_approval_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.term_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  term text NOT NULL,
  academic_year text NOT NULL,
  status text DEFAULT 'pending',
  amount_due numeric DEFAULT 0,
  amount_paid numeric DEFAULT 0,
  registered_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.term_registrations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.term_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  term text NOT NULL,
  academic_year text NOT NULL,
  position integer,
  comments text,
  report_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.term_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BOARDING / WELFARE
-- ============================================
CREATE TABLE IF NOT EXISTS public.hostels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gender text,
  capacity integer,
  matron text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid REFERENCES public.hostels(id) ON DELETE CASCADE,
  room_number text NOT NULL,
  capacity integer DEFAULT 4,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.bed_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  bed_number text,
  academic_year text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bed_allocations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.health_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  symptoms text,
  treatment text,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.health_visits ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.textbook_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  book_title text NOT NULL,
  issued_date date DEFAULT CURRENT_DATE,
  returned_date date,
  condition text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.textbook_issues ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INVENTORY
-- ============================================
CREATE TABLE IF NOT EXISTS public.inventory_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid REFERENCES public.inventory_categories(id),
  quantity integer NOT NULL DEFAULT 0,
  unit text,
  reorder_level integer DEFAULT 0,
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  transaction_type text NOT NULL DEFAULT 'in',
  quantity integer NOT NULL,
  notes text,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- LEAVE / AUDIT
-- ============================================
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid,
  leave_type text NOT NULL DEFAULT 'annual',
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status text DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER: admin-or-management check
-- ============================================
CREATE OR REPLACE FUNCTION public.is_school_admin(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role IN
    ('admin','admin_supervisor','principal','deputy_principal','supervisor'));
$$;

-- ============================================
-- RLS POLICIES (broad: admins manage, authenticated read, public reads for site content)
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
CREATE POLICY "profiles_self_read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR auth.uid() = user_id OR public.is_school_admin(auth.uid()));
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id OR auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated USING (public.is_school_admin(auth.uid())) WITH CHECK (public.is_school_admin(auth.uid()));

-- Generic policy generator pattern via DO block
DO $policies$
DECLARE
  t text;
  admin_tables text[] := ARRAY[
    'students','staff','classes','subjects','class_subjects','enrollments','student_classes',
    'attendance','marks','exams','exam_results','exam_timetable_entries',
    'assessments','assessment_results','assessment_submissions',
    'timetable_entries','personal_timetables',
    'homework','lesson_plans','study_materials','teacher_resources',
    'announcements','notifications','conversations','conversation_participants','messages',
    'communication_logs','parent_communication_logs','sms_templates',
    'meetings','appointments','events',
    'facilities','awards','award_photos','school_projects','sports_schedule',
    'parent_students','parent_student_links','student_verification_codes','user_blocks','user_reports',
    'fee_structures','invoices','invoice_items','expenses','petty_cash',
    'supplier_invoices','supplier_payments','finance_approval_requests',
    'term_registrations','term_reports',
    'hostels','rooms','bed_allocations','health_visits','textbook_issues',
    'inventory_categories','inventory_items','inventory_transactions',
    'leave_requests','audit_logs'
  ];
BEGIN
  FOREACH t IN ARRAY admin_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_auth_read" ON public.%1$s', t);
    EXECUTE format('CREATE POLICY "%1$s_auth_read" ON public.%1$s FOR SELECT TO authenticated USING (true)', t);
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_admin_all" ON public.%1$s', t);
    EXECUTE format('CREATE POLICY "%1$s_admin_all" ON public.%1$s FOR ALL TO authenticated USING (public.is_school_admin(auth.uid())) WITH CHECK (public.is_school_admin(auth.uid()))', t);
  END LOOP;
END
$policies$;

-- Teachers can also write to academic content
DO $teach$
DECLARE
  t text;
  teacher_tables text[] := ARRAY[
    'attendance','marks','exam_results','assessments','assessment_results',
    'homework','lesson_plans','study_materials','teacher_resources','announcements',
    'parent_communication_logs','personal_timetables'
  ];
BEGIN
  FOREACH t IN ARRAY teacher_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_teacher_write" ON public.%1$s', t);
    EXECUTE format('CREATE POLICY "%1$s_teacher_write" ON public.%1$s FOR ALL TO authenticated USING (has_any_role(auth.uid(), ARRAY[''teacher''::app_role,''hod''::app_role])) WITH CHECK (has_any_role(auth.uid(), ARRAY[''teacher''::app_role,''hod''::app_role]))', t);
  END LOOP;
END
$teach$;

-- Public-readable site content (no auth required)
DO $public$
DECLARE
  t text;
  pub_tables text[] := ARRAY[
    'carousel_images','gallery_images','facility_images','facilities','awards','award_photos',
    'school_projects','sports_schedule','downloads','site_settings','events','meetings',
    'announcements','staff'
  ];
BEGIN
  FOREACH t IN ARRAY pub_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_public_read" ON public.%1$s', t);
    EXECUTE format('CREATE POLICY "%1$s_public_read" ON public.%1$s FOR SELECT USING (true)', t);
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_admin_manage" ON public.%1$s', t);
    EXECUTE format('CREATE POLICY "%1$s_admin_manage" ON public.%1$s FOR ALL TO authenticated USING (public.is_school_admin(auth.uid())) WITH CHECK (public.is_school_admin(auth.uid()))', t);
  END LOOP;
END
$public$;

-- Contact messages: anyone can send, admins read
DROP POLICY IF EXISTS "contact_anyone_insert" ON public.contact_messages;
CREATE POLICY "contact_anyone_insert" ON public.contact_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "contact_admin_read" ON public.contact_messages;
CREATE POLICY "contact_admin_read" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_school_admin(auth.uid()));

-- Students can view their own academic data
DROP POLICY IF EXISTS "students_self_read" ON public.students;
CREATE POLICY "students_self_read" ON public.students FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Parents can read their linked children's data
DROP POLICY IF EXISTS "parents_read_links" ON public.parent_students;
CREATE POLICY "parents_read_links" ON public.parent_students FOR SELECT TO authenticated USING (parent_id = auth.uid());

-- Notifications: users see their own
DROP POLICY IF EXISTS "notifications_own_read" ON public.notifications;
CREATE POLICY "notifications_own_read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications_own_update" ON public.notifications;
CREATE POLICY "notifications_own_update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Messages: participants can read/write
DROP POLICY IF EXISTS "messages_participant_read" ON public.messages;
CREATE POLICY "messages_participant_read" ON public.messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid())
);
DROP POLICY IF EXISTS "messages_participant_insert" ON public.messages;
CREATE POLICY "messages_participant_insert" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid())
);

-- Leave requests: staff manages their own
DROP POLICY IF EXISTS "leave_self_manage" ON public.leave_requests;
CREATE POLICY "leave_self_manage" ON public.leave_requests FOR ALL TO authenticated USING (staff_id = auth.uid()) WITH CHECK (staff_id = auth.uid());

-- updated_at triggers
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_students_updated_at ON public.students;
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_staff_updated_at ON public.staff;
CREATE TRIGGER trg_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_invoices_updated_at ON public.invoices;
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-generate student admission numbers (MHS prefix per branding)
CREATE OR REPLACE FUNCTION public.gen_admission_number()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.admission_number IS NULL OR NEW.admission_number = '' THEN
    NEW.admission_number := 'MHS' || LPAD(nextval('public.student_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_students_admission_number ON public.students;
CREATE TRIGGER trg_students_admission_number BEFORE INSERT ON public.students FOR EACH ROW EXECUTE FUNCTION public.gen_admission_number();

-- Auto-generate staff numbers (MHS-S prefix)
CREATE OR REPLACE FUNCTION public.gen_staff_number()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.staff_number IS NULL OR NEW.staff_number = '' THEN
    NEW.staff_number := 'MHS-S' || LPAD(nextval('public.staff_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_staff_number ON public.staff;
CREATE TRIGGER trg_staff_number BEFORE INSERT ON public.staff FOR EACH ROW EXECUTE FUNCTION public.gen_staff_number();