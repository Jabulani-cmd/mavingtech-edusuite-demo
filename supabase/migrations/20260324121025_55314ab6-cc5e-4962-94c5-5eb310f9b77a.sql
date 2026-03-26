
-- Lesson Plans table
CREATE TABLE public.lesson_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  class_id UUID REFERENCES public.classes(id),
  title TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER DEFAULT 40,
  objectives TEXT,
  materials_needed TEXT,
  introduction TEXT,
  main_activity TEXT,
  conclusion TEXT,
  assessment_strategy TEXT,
  homework_notes TEXT,
  reflection TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own lesson plans" ON public.lesson_plans
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Teacher Resources table
CREATE TABLE public.teacher_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL DEFAULT 'link',
  url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own resources" ON public.teacher_resources
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Parent Communication Logs table
CREATE TABLE public.parent_communication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  student_id UUID REFERENCES public.students(id),
  parent_name TEXT,
  communication_type TEXT NOT NULL DEFAULT 'phone_call',
  subject TEXT NOT NULL,
  notes TEXT,
  follow_up_date DATE,
  follow_up_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.parent_communication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own communication logs" ON public.parent_communication_logs
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());
