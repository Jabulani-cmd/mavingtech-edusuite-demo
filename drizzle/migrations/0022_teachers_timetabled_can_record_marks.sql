-- ============================================
-- TEACHERS CAN RECORD MARKS FOR CLASSES THEY ARE TIMETABLED TO TEACH
-- A teacher could be on the weekly timetable for a class (timetable_entries) without
-- having a class_subjects row or being its class teacher. The teacher-scope rules then
-- treated them as teaching nothing, and saving a mark failed with
--   "new row violates row-level security policy for table marks".
-- teaches_class() now also counts a timetable entry for that class. The timetable can only be
-- edited by administrators and school leaders, so a teacher cannot grant themselves access.
-- Idempotent: safe to run more than once.
-- ============================================

CREATE OR REPLACE FUNCTION public.teaches_class(_uid uuid, _class_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _uid IS NOT NULL AND _class_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.user_id = _uid
      AND (EXISTS (SELECT 1 FROM public.class_subjects cs WHERE cs.class_id = _class_id AND cs.teacher_id = s.id)
           OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = _class_id AND c.class_teacher_id = s.id)
           OR EXISTS (SELECT 1 FROM public.timetable_entries te WHERE te.class_id = _class_id AND te.teacher_id = s.id))
  );
$$;

REVOKE ALL ON FUNCTION public.teaches_class(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.teaches_class(uuid, uuid) TO authenticated, service_role;