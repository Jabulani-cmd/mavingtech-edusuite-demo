
-- Cascade-delete a class and all dependent records safely in one transaction
CREATE OR REPLACE FUNCTION public.delete_class_cascade(_class_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Conversations -> messages, participants -> conversations
  DELETE FROM messages
  WHERE conversation_id IN (SELECT id FROM conversations WHERE class_id = _class_id);

  DELETE FROM conversation_participants
  WHERE conversation_id IN (SELECT id FROM conversations WHERE class_id = _class_id);

  DELETE FROM conversations WHERE class_id = _class_id;

  -- Assessments -> results/submissions -> assessments
  DELETE FROM assessment_results
  WHERE assessment_id IN (SELECT id FROM assessments WHERE class_id = _class_id);

  DELETE FROM assessment_submissions
  WHERE assessment_id IN (SELECT id FROM assessments WHERE class_id = _class_id);

  DELETE FROM assessments WHERE class_id = _class_id;

  -- Direct dependencies
  DELETE FROM study_materials WHERE class_id = _class_id;
  DELETE FROM homework WHERE class_id = _class_id;
  DELETE FROM timetable_entries WHERE class_id = _class_id;
  DELETE FROM timetable WHERE class_id = _class_id;
  DELETE FROM class_subjects WHERE class_id = _class_id;
  DELETE FROM student_classes WHERE class_id = _class_id;
  DELETE FROM enrollments WHERE class_id = _class_id;
  DELETE FROM attendance WHERE class_id = _class_id;

  -- Finally, delete class
  DELETE FROM classes WHERE id = _class_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_class_cascade(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_class_cascade(uuid) TO authenticated;
