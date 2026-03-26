
-- Make the trigger also fire on UPDATE so we can backfill
DROP TRIGGER IF EXISTS trg_generate_staff_number ON public.staff;
CREATE TRIGGER trg_generate_staff_number
  BEFORE INSERT OR UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_staff_number();
