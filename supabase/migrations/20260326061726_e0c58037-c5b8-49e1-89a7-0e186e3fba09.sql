
-- Recreate the notify_leave_request function to include deputy_principal
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
    WHERE ur.role IN ('hod', 'principal', 'deputy_principal')
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

-- Create the trigger on leave_requests table
CREATE TRIGGER notify_leave_request_trigger
  AFTER INSERT ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_leave_request();

-- Create a function to notify the applicant when their leave status changes
CREATE OR REPLACE FUNCTION public.notify_leave_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_staff_user_id UUID;
  v_status_label TEXT;
BEGIN
  -- Only fire when status actually changes
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status != 'pending' THEN
    SELECT user_id INTO v_staff_user_id FROM staff WHERE id = NEW.staff_id;
    
    IF v_staff_user_id IS NOT NULL THEN
      IF NEW.status = 'approved' THEN
        v_status_label := 'approved';
      ELSIF NEW.status = 'rejected' THEN
        v_status_label := 'declined';
      ELSIF NEW.status = 'discuss' THEN
        v_status_label := 'flagged for discussion — please see your supervisor';
      ELSE
        v_status_label := NEW.status;
      END IF;

      INSERT INTO notifications (user_id, title, message, type)
      VALUES (
        v_staff_user_id,
        'Leave Request Update',
        'Your ' || NEW.leave_type || ' leave request (' || NEW.start_date || ' to ' || NEW.end_date || ') has been ' || v_status_label || '.',
        'leave_request'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger for status changes
CREATE TRIGGER notify_leave_status_change_trigger
  AFTER UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_leave_status_change();
