DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_invoice_id_fkey'
      AND conrelid = 'public.payments'::regclass
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_invoice_id_fkey
      FOREIGN KEY (invoice_id)
      REFERENCES public.invoices(id)
      ON DELETE SET NULL
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_student_id_fkey'
      AND conrelid = 'public.payments'::regclass
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_student_id_fkey
      FOREIGN KEY (student_id)
      REFERENCES public.students(id)
      ON DELETE SET NULL
      NOT VALID;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.payments_sync_amount()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.amount_usd IS NULL OR NEW.amount_usd = 0 THEN
    NEW.amount_usd := COALESCE(NEW.amount, 0);
  END IF;

  IF NEW.amount IS NULL OR NEW.amount = 0 THEN
    NEW.amount := COALESCE(NEW.amount_usd, 0);
  END IF;

  IF NEW.currency IS NULL OR NEW.currency = 'USD' THEN
    NEW.currency := 'ZAR';
  END IF;

  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.prepare_payment_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_invoice_student_id uuid;
BEGIN
  IF NEW.invoice_id IS NOT NULL THEN
    SELECT student_id INTO v_invoice_student_id
    FROM public.invoices
    WHERE id = NEW.invoice_id;

    IF v_invoice_student_id IS NOT NULL THEN
      NEW.student_id := v_invoice_student_id;
    END IF;
  END IF;

  IF auth.uid() IS NOT NULL AND NOT public.is_finance_admin(auth.uid()) THEN
    NEW.parent_id := auth.uid();
    NEW.recorded_by := auth.uid();

    -- Parent portal payments are only inserted after a successful simulated gateway result.
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

  SELECT COALESCE(total_usd, amount_usd, 0)
  INTO v_total
  FROM public.invoices
  WHERE id = _invoice_id;

  IF v_total IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(COALESCE(amount_usd, amount, 0)), 0)
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

DROP TRIGGER IF EXISTS trg_payments_sync_amount ON public.payments;
CREATE TRIGGER trg_payments_sync_amount
BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.payments_sync_amount();

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

UPDATE public.payments AS p
SET student_id = i.student_id
FROM public.invoices AS i
WHERE p.invoice_id = i.id
  AND p.student_id IS DISTINCT FROM i.student_id;

UPDATE public.payments
SET amount_usd = COALESCE(amount_usd, amount, 0),
    amount = COALESCE(amount, amount_usd, 0),
    currency = 'ZAR'
WHERE amount_usd IS NULL
   OR amount_usd = 0
   OR amount IS NULL
   OR amount = 0
   OR currency IS NULL
   OR currency = 'USD';

UPDATE public.invoices AS inv
SET paid_usd = COALESCE(paid.total_paid, 0),
    amount_paid = COALESCE(paid.total_paid, 0),
    status = CASE WHEN COALESCE(paid.total_paid, 0) >= COALESCE(inv.total_usd, inv.amount_usd, 0) - 0.001 THEN 'paid'
                  WHEN COALESCE(paid.total_paid, 0) > 0 THEN 'partial'
                  ELSE 'unpaid' END
FROM (
  SELECT i.id AS invoice_id,
         COALESCE(SUM(COALESCE(p.amount_usd, p.amount, 0)) FILTER (WHERE p.payment_status = 'paid'::payment_status), 0) AS total_paid
  FROM public.invoices i
  LEFT JOIN public.payments p ON p.invoice_id = i.id
  GROUP BY i.id
) AS paid
WHERE inv.id = paid.invoice_id;

NOTIFY pgrst, 'reload schema';