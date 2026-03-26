
-- Create cascade delete function for students
CREATE OR REPLACE FUNCTION public.delete_student_cascade(_student_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete all FK-dependent records
  DELETE FROM marks WHERE student_id = _student_id;
  DELETE FROM exam_results WHERE student_id = _student_id;
  DELETE FROM assessment_results WHERE student_id = _student_id;
  DELETE FROM assessment_submissions WHERE student_id = _student_id;
  DELETE FROM attendance WHERE student_id = _student_id;
  DELETE FROM student_classes WHERE student_id = _student_id;
  DELETE FROM enrollments WHERE student_id = _student_id;
  DELETE FROM guardians WHERE student_id = _student_id;
  DELETE FROM health_visits WHERE student_id = _student_id;
  DELETE FROM bed_allocations WHERE student_id = _student_id;
  DELETE FROM term_registrations WHERE student_id = _student_id;
  DELETE FROM term_reports WHERE student_id = _student_id;
  DELETE FROM student_restrictions WHERE student_id = _student_id;
  DELETE FROM parent_communication_logs WHERE student_id = _student_id;
  DELETE FROM textbook_issues WHERE student_id = _student_id;
  DELETE FROM student_verification_codes WHERE student_id = _student_id;
  
  -- Handle invoices -> invoice_items and payments
  DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE student_id = _student_id);
  DELETE FROM payments WHERE student_id = _student_id;
  DELETE FROM invoices WHERE student_id = _student_id;
  DELETE FROM online_payments WHERE student_id = _student_id;

  -- Finally delete the student
  DELETE FROM students WHERE id = _student_id;
END;
$$;

-- Create cascade delete function for staff (without auth user)
CREATE OR REPLACE FUNCTION public.delete_staff_cascade(_staff_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Nullify FK references
  UPDATE classes SET class_teacher_id = NULL WHERE class_teacher_id = _staff_id;
  UPDATE class_subjects SET teacher_id = NULL WHERE teacher_id = _staff_id;
  UPDATE timetable_entries SET teacher_id = NULL WHERE teacher_id = _staff_id;
  UPDATE hostels SET housemaster_id = NULL WHERE housemaster_id = _staff_id;
  UPDATE hostels SET assistant_housemaster_id = NULL WHERE assistant_housemaster_id = _staff_id;
  
  -- Delete owned records
  DELETE FROM contracts WHERE staff_id = _staff_id;
  DELETE FROM leave_requests WHERE staff_id = _staff_id;
  
  -- Delete the staff record
  DELETE FROM staff WHERE id = _staff_id;
END;
$$;
