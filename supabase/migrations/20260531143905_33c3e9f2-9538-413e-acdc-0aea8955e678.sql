DELETE FROM public.timetable_entries WHERE teacher_id IS NOT NULL AND teacher_id NOT IN (SELECT id FROM public.staff);

ALTER TABLE public.timetable_entries
  ADD CONSTRAINT timetable_entries_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.staff(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tt_class ON public.timetable_entries(class_id);
CREATE INDEX IF NOT EXISTS idx_tt_teacher ON public.timetable_entries(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tt_subject ON public.timetable_entries(subject_id);

-- Enable realtime so timetable changes propagate to all portals
ALTER TABLE public.timetable_entries REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timetable_entries;