
-- Create a sequence for student numbers
CREATE SEQUENCE IF NOT EXISTS public.student_number_seq START WITH 1001;

-- Create function to generate GHS student numbers
CREATE OR REPLACE FUNCTION public.generate_admission_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.admission_number IS NULL OR NEW.admission_number = '' THEN
    NEW.admission_number := 'GHS' || LPAD(nextval('public.student_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to students table
CREATE TRIGGER trg_generate_admission_number
  BEFORE INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_admission_number();

-- Set the sequence to start after the highest existing number
DO $$
DECLARE
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CASE 
      WHEN admission_number ~ '^GHS[0-9]+$' 
      THEN SUBSTRING(admission_number FROM 4)::INTEGER 
      ELSE 0 
    END
  ), 1000) INTO max_num FROM public.students;
  PERFORM setval('public.student_number_seq', max_num + 1, false);
END $$;
