
-- Auto-generate staff_number on insert
CREATE OR REPLACE FUNCTION public.generate_staff_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
  new_staff_number TEXT;
BEGIN
  IF NEW.staff_number IS NULL OR NEW.staff_number = '' THEN
    SELECT COALESCE(MAX(
      CASE WHEN staff_number ~ '^GHS-\d+$' 
           THEN CAST(SUBSTRING(staff_number FROM 5) AS INTEGER)
           ELSE 0
      END
    ), 0) + 1
    INTO next_num
    FROM public.staff;
    
    new_staff_number := 'GHS-' || LPAD(next_num::TEXT, 4, '0');
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.staff WHERE staff_number = new_staff_number) LOOP
      next_num := next_num + 1;
      new_staff_number := 'GHS-' || LPAD(next_num::TEXT, 4, '0');
    END LOOP;
    
    NEW.staff_number := new_staff_number;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_staff_number ON public.staff;
CREATE TRIGGER trg_generate_staff_number
  BEFORE INSERT ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_staff_number();
