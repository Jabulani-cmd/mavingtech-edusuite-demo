ALTER TABLE public.classes
  ADD CONSTRAINT classes_class_teacher_id_fkey
  FOREIGN KEY (class_teacher_id) REFERENCES public.staff(id) ON DELETE SET NULL;
NOTIFY pgrst, 'reload schema';