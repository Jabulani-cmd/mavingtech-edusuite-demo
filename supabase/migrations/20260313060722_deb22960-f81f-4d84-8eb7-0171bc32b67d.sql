
-- Add email column to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS email TEXT;

-- Create a trigger to sync email from profiles when user_id is set
CREATE OR REPLACE FUNCTION public.sync_student_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL AND (NEW.email IS NULL OR NEW.email = '') THEN
    SELECT email INTO NEW.email FROM public.profiles WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_student_email_on_insert
  BEFORE INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_student_email();

CREATE TRIGGER sync_student_email_on_update
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_student_email();

-- Backfill existing students with emails from profiles
UPDATE public.students s
SET email = p.email
FROM public.profiles p
WHERE s.user_id = p.id AND (s.email IS NULL OR s.email = '');
