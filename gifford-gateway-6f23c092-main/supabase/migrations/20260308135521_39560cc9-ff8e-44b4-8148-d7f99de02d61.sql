
-- Hostels table (boys-only school, no gender field)
CREATE TABLE public.hostels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  total_capacity INTEGER NOT NULL DEFAULT 0,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  housemaster_id UUID REFERENCES public.staff(id),
  assistant_housemaster_id UUID REFERENCES public.staff(id),
  phone TEXT,
  location TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  room_type TEXT NOT NULL DEFAULT 'dormitory',
  capacity INTEGER NOT NULL DEFAULT 1,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  floor INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hostel_id, room_number)
);

-- Bed allocations
CREATE TABLE public.bed_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id),
  bed_number TEXT,
  allocation_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  allocation_end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Health visits / sick bay
CREATE TABLE public.health_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id),
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  symptoms TEXT,
  diagnosis TEXT,
  treatment TEXT,
  medication_given TEXT,
  follow_up_date DATE,
  visited_by TEXT,
  notes TEXT,
  parent_notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bed_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_visits ENABLE ROW LEVEL SECURITY;

-- Hostels policies
CREATE POLICY "Admins manage hostels" ON public.hostels FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated read hostels" ON public.hostels FOR SELECT
  USING (true);

-- Rooms policies
CREATE POLICY "Admins manage rooms" ON public.rooms FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated read rooms" ON public.rooms FOR SELECT
  USING (true);

-- Bed allocations policies
CREATE POLICY "Admins manage bed_allocations" ON public.bed_allocations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers read bed_allocations" ON public.bed_allocations FOR SELECT
  USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Students read own allocation" ON public.bed_allocations FOR SELECT
  USING (student_id IN (SELECT s.id FROM students s WHERE s.user_id = auth.uid()));

-- Health visits policies
CREATE POLICY "Admins manage health_visits" ON public.health_visits FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers manage health_visits" ON public.health_visits FOR ALL
  USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Students read own health_visits" ON public.health_visits FOR SELECT
  USING (student_id IN (SELECT s.id FROM students s WHERE s.user_id = auth.uid()));
CREATE POLICY "Parents read child health_visits" ON public.health_visits FOR SELECT
  USING (student_id IN (SELECT ps.student_id FROM parent_students ps WHERE ps.parent_id = auth.uid()));
