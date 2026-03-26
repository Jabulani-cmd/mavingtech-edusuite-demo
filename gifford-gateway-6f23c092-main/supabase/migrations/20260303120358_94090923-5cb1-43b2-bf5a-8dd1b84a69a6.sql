
-- Parent-student linking table
CREATE TABLE public.parent_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  student_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents read own links" ON public.parent_students
  FOR SELECT TO authenticated
  USING (auth.uid() = parent_id);

CREATE POLICY "Admins manage parent_students" ON public.parent_students
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents insert own links" ON public.parent_students
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = parent_id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS class_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
