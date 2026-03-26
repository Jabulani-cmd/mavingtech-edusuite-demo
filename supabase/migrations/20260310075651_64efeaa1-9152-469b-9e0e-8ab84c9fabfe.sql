
-- Create sequence for staff numbers
CREATE SEQUENCE IF NOT EXISTS public.staff_number_seq START WITH 1 INCREMENT BY 1;

-- Sync sequence with existing staff numbers
DO $$
DECLARE
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(staff_number FROM 6) AS INTEGER)), 0)
  INTO max_num
  FROM staff
  WHERE staff_number ~ '^GHS-S[0-9]+$';
  
  IF max_num > 0 THEN
    PERFORM setval('public.staff_number_seq', max_num);
  END IF;
END $$;

-- Create trigger function for auto-generating staff numbers
CREATE OR REPLACE FUNCTION public.generate_staff_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  max_num INTEGER;
  next_num INTEGER;
BEGIN
  IF NEW.staff_number IS NULL OR NEW.staff_number = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(staff_number FROM 6) AS INTEGER)), 0)
    INTO max_num
    FROM staff
    WHERE staff_number ~ '^GHS-S[0-9]+$';
    
    PERFORM setval('public.staff_number_seq', GREATEST(max_num, (SELECT last_value FROM public.staff_number_seq)));
    
    next_num := nextval('public.staff_number_seq');
    
    NEW.staff_number := 'GHS-S' || LPAD(next_num::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger on staff table
DROP TRIGGER IF EXISTS trg_generate_staff_number ON public.staff;
CREATE TRIGGER trg_generate_staff_number
  BEFORE INSERT ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_staff_number();
