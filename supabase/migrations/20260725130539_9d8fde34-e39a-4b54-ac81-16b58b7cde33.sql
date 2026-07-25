CREATE OR REPLACE FUNCTION public.prepare_payment_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_invoice_student_id uuid;
  v_invoice_total numeric := 0;
  v_existing_paid numeric := 0;
  v_payment_amount numeric := 0;
BEGIN
  IF NEW.invoice_id IS NOT NULL THEN
    SELECT student_id, COALESCE(NULLIF(total_usd, 0), amount_usd, 0)
      INTO v_invoice_student_id, v_invoice_total
    FROM public.invoices
    WHERE id = NEW.invoice_id;

    IF v_invoice_student_id IS NOT NULL THEN
      NEW.student_id := v_invoice_student_id;
    END IF;
  END IF;

  IF auth.uid() IS NOT NULL AND NOT public.is_finance_admin(auth.uid()) THEN
    NEW.parent_id := auth.uid();
    NEW.recorded_by := auth.uid();

    IF NEW.payment_status IS NULL OR NEW.payment_status = 'pending'::payment_status THEN
      NEW.payment_status := 'paid'::payment_status;
    END IF;
  END IF;

  IF NEW.amount_usd IS NULL OR NEW.amount_usd = 0 THEN
    NEW.amount_usd := COALESCE(NEW.amount, 0);
  END IF;

  IF NEW.amount IS NULL OR NEW.amount = 0 THEN
    NEW.amount := COALESCE(NEW.amount_usd, 0);
  END IF;

  IF NEW.currency IS NULL OR NEW.currency = 'USD' THEN
    NEW.currency := 'ZAR';
  END IF;

  v_payment_amount := COALESCE(NULLIF(NEW.amount_usd, 0), NEW.amount, 0);

  IF NEW.invoice_id IS NOT NULL AND NEW.payment_status = 'paid'::payment_status THEN
    SELECT COALESCE(SUM(COALESCE(NULLIF(p.amount_usd, 0), p.amount, 0)), 0)
      INTO v_existing_paid
    FROM public.payments p
    WHERE p.invoice_id = NEW.invoice_id
      AND p.payment_status = 'paid'::payment_status
      AND (TG_OP = 'INSERT' OR p.id <> NEW.id);

    IF v_existing_paid + v_payment_amount > v_invoice_total + 0.001 THEN
      RAISE EXCEPTION 'Payment exceeds outstanding invoice balance'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

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

  SELECT LEAST(
           v_total,
           COALESCE(SUM(COALESCE(NULLIF(amount_usd, 0), amount, 0)), 0)
         )
    INTO v_paid
  FROM public.payments
  WHERE invoice_id = _invoice_id
    AND payment_status = 'paid'::payment_status;

  UPDATE public.invoices
     SET paid_usd = v_paid,
         amount_paid = v_paid,
         status = CASE
           WHEN v_paid >= v_total - 0.001 THEN 'paid'
           WHEN v_paid > 0 THEN 'partial'
           ELSE 'unpaid'
         END
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
  v_new_invoice_id uuid;
  v_old_invoice_id uuid;
BEGIN
  v_new_invoice_id := CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN NEW.invoice_id ELSE NULL END;
  v_old_invoice_id := CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN OLD.invoice_id ELSE NULL END;

  IF v_old_invoice_id IS NOT NULL AND v_old_invoice_id IS DISTINCT FROM v_new_invoice_id THEN
    PERFORM public.recalculate_invoice_payment_totals(v_old_invoice_id);
  END IF;

  IF v_new_invoice_id IS NOT NULL THEN
    PERFORM public.recalculate_invoice_payment_totals(v_new_invoice_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

DROP TRIGGER IF EXISTS trg_prepare_payment_owner ON public.payments;
CREATE TRIGGER trg_prepare_payment_owner
BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.prepare_payment_owner();

DROP TRIGGER IF EXISTS trg_sync_invoice_on_payment ON public.payments;
CREATE TRIGGER trg_sync_invoice_on_payment
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.sync_invoice_on_payment();

DROP TRIGGER IF EXISTS trg_auto_invoice_student ON public.students;
CREATE TRIGGER trg_auto_invoice_student
AFTER INSERT ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.auto_invoice_student();