
-- Make admission_number nullable so trigger can set it
ALTER TABLE public.students ALTER COLUMN admission_number DROP NOT NULL;

-- Grant sequence usage to authenticated role for the trigger
GRANT USAGE, SELECT ON SEQUENCE public.student_number_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.student_number_seq TO anon;

-- Reset sequence based on max existing number
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
