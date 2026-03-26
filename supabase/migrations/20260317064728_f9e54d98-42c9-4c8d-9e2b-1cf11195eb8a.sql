
-- 1. Add missing 'description' column to marks table
ALTER TABLE public.marks ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Fix study_materials RLS - drop and recreate with explicit with_check
DROP POLICY IF EXISTS "Teachers manage own materials" ON public.study_materials;
CREATE POLICY "Teachers manage own materials" ON public.study_materials
  FOR ALL TO authenticated
  USING ((teacher_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK ((teacher_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix assessments RLS - ensure explicit with_check
DROP POLICY IF EXISTS "Teachers manage own assessments" ON public.assessments;
CREATE POLICY "Teachers manage own assessments" ON public.assessments
  FOR ALL TO authenticated
  USING ((teacher_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK ((teacher_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- 4. Allow HOD and Deputy Principal to update leave_requests (approve/reject)
CREATE POLICY "HOD update leave_requests"
  ON public.leave_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'hod'::app_role))
  WITH CHECK (has_role(auth.uid(), 'hod'::app_role));

CREATE POLICY "Deputy principal update leave_requests"
  ON public.leave_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'deputy_principal'::app_role))
  WITH CHECK (has_role(auth.uid(), 'deputy_principal'::app_role));

-- 5. Create trigger to notify HOD and principal on new leave requests
CREATE OR REPLACE FUNCTION public.notify_leave_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_staff_name TEXT;
  v_role_user RECORD;
BEGIN
  SELECT full_name INTO v_staff_name FROM staff WHERE id = NEW.staff_id;

  FOR v_role_user IN
    SELECT ur.user_id FROM user_roles ur
    WHERE ur.role IN ('hod', 'principal')
  LOOP
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      v_role_user.user_id,
      'New Leave Request',
      COALESCE(v_staff_name, 'A staff member') || ' has requested ' || NEW.leave_type || ' leave from ' || NEW.start_date || ' to ' || NEW.end_date,
      'leave_request'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_leave_request_created ON public.leave_requests;
CREATE TRIGGER on_leave_request_created
  AFTER INSERT ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_leave_request();
