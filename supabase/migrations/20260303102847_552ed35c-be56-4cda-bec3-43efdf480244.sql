
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('student', 'parent', 'teacher', 'admin');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Classes
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Subjects
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Student-class assignments
CREATE TABLE public.student_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  UNIQUE(student_id, class_id)
);
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;

-- Marks
CREATE TABLE public.marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  assessment_type TEXT NOT NULL DEFAULT 'test',
  mark INTEGER NOT NULL,
  term TEXT NOT NULL DEFAULT 'Term 1',
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- Homework
CREATE TABLE public.homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;

-- Announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Timetable
CREATE TABLE public.timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  time_slot TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  UNIQUE(class_id, day_of_week, time_slot)
);
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

-- Events / calendar
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Staff directory
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  title TEXT,
  department TEXT,
  email TEXT,
  phone TEXT,
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Contact messages
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles: users read own, admins read all
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles: users read own, admins manage
CREATE POLICY "Users read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Classes: all authenticated can read
CREATE POLICY "Authenticated read classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage classes" ON public.classes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Subjects: all authenticated can read
CREATE POLICY "Authenticated read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage subjects" ON public.subjects FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Student classes
CREATE POLICY "Students read own class" ON public.student_classes FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins manage student_classes" ON public.student_classes FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers read student_classes" ON public.student_classes FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));

-- Marks
CREATE POLICY "Students read own marks" ON public.marks FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Teachers manage marks" ON public.marks FOR ALL USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Parents read child marks" ON public.marks FOR SELECT USING (public.has_role(auth.uid(), 'parent'));
CREATE POLICY "Admins manage marks" ON public.marks FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Homework
CREATE POLICY "Authenticated read homework" ON public.homework FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage homework" ON public.homework FOR ALL USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Admins manage homework" ON public.homework FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Announcements: public ones readable by all, manage by admin
CREATE POLICY "Anyone read public announcements" ON public.announcements FOR SELECT USING (is_public = true);
CREATE POLICY "Authenticated read all announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Timetable
CREATE POLICY "Authenticated read timetable" ON public.timetable FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage timetable" ON public.timetable FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Events: public
CREATE POLICY "Anyone read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins manage events" ON public.events FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Staff: public read
CREATE POLICY "Anyone read staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Admins manage staff" ON public.staff FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Contact messages: anyone can insert, admins read
CREATE POLICY "Anyone can send message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read messages" ON public.contact_messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
