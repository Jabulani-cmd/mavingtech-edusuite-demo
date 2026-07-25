CREATE OR REPLACE FUNCTION public.prepare_payment_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_finance_admin(auth.uid()) THEN
    NEW.parent_id := auth.uid();
    NEW.recorded_by := auth.uid();
  END IF;

  IF NEW.currency IS NULL OR NEW.currency = 'USD' THEN
    NEW.currency := 'ZAR';
  END IF;

  RETURN NEW;
END;
$$;