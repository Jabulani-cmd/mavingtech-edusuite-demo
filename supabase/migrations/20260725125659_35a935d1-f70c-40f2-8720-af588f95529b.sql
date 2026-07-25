CREATE OR REPLACE FUNCTION public.recalculate_invoice_payment_totals(_invoice_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_total numeric;
  v_paid numeric;
BEGIN
  IF _invoice_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(NULLIF(total_usd, 0), amount_usd, 0)
  INTO v_total
  FROM public.invoices
  WHERE id = _invoice_id;

  IF v_total IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(COALESCE(NULLIF(amount_usd, 0), amount, 0)), 0)
  INTO v_paid
  FROM public.payments
  WHERE invoice_id = _invoice_id
    AND payment_status = 'paid'::payment_status;

  UPDATE public.invoices
     SET paid_usd = v_paid,
         amount_paid = v_paid,
         status = CASE WHEN v_paid >= v_total - 0.001 THEN 'paid'
                       WHEN v_paid > 0 THEN 'partial'
                       ELSE 'unpaid' END
   WHERE id = _invoice_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_invoice_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_invoice_id uuid;
BEGIN
  v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);
  PERFORM public.recalculate_invoice_payment_totals(v_invoice_id);
  RETURN COALESCE(NEW, OLD);
END;
$function$;