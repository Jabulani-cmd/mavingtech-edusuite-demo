
-- Students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admission_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  form TEXT NOT NULL DEFAULT 'Form 1',
  stream TEXT,
  subject_combination TEXT,
  gender TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  emergency_contact TEXT,
  medical_conditions TEXT,
  has_medical_alert BOOLEAN NOT NULL DEFAULT false,
  address TEXT,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active',
  profile_photo_url TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID
);

-- Enrollments table
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id),
  academic_year TEXT NOT NULL,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Guardians table
CREATE TABLE public.guardians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT,
  email TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL DEFAULT 'permanent',
  start_date DATE NOT NULL,
  end_date DATE,
  salary NUMERIC(12,2),
  documents TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leave requests table
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL DEFAULT 'annual',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to staff table
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS staff_number TEXT UNIQUE;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'teacher';
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS subjects_taught TEXT[];
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS employment_date DATE;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS qualifications TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS nssa_number TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS paye_number TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS bank_details TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS national_id TEXT;

-- RLS for students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage students" ON public.students FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers view students" ON public.students FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Students view own record" ON public.students FOR SELECT USING (auth.uid() = user_id);

-- RLS for enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage enrollments" ON public.enrollments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated read enrollments" ON public.enrollments FOR SELECT USING (true);

-- RLS for guardians
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage guardians" ON public.guardians FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated read guardians" ON public.guardians FOR SELECT USING (true);

-- RLS for contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage contracts" ON public.contracts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS for leave_requests
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage leave_requests" ON public.leave_requests FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff view own leave" ON public.leave_requests FOR SELECT USING (
  staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
);
CREATE POLICY "Staff insert own leave" ON public.leave_requests FOR INSERT WITH CHECK (
  staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
);

-- Storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true) ON CONFLICT (id) DO NOTHING;

-- Storage RLS for profile-photos
CREATE POLICY "Anyone can view profile photos" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Admins manage profile photos" ON storage.objects FOR ALL USING (bucket_id = 'profile-photos' AND public.has_role(auth.uid(), 'admin'));
