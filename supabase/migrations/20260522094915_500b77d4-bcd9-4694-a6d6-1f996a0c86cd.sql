
CREATE OR REPLACE FUNCTION public.generate_admission_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.admission_number IS NULL OR NEW.admission_number = '' THEN
    NEW.admission_number := 'MHS' || LPAD(nextval('public.student_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_staff_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  max_num INTEGER;
  next_num INTEGER;
BEGIN
  IF NEW.staff_number IS NULL OR NEW.staff_number = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(staff_number FROM 6) AS INTEGER)), 0)
    INTO max_num
    FROM staff
    WHERE staff_number ~ '^MHS-S[0-9]+$';

    PERFORM setval('public.staff_number_seq', GREATEST(max_num, (SELECT last_value FROM public.staff_number_seq)));

    next_num := nextval('public.staff_number_seq');

    NEW.staff_number := 'MHS-S' || LPAD(next_num::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$function$;
