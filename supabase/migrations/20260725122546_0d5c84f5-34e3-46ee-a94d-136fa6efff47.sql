CREATE OR REPLACE FUNCTION public.sync_invoice_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invoice_id uuid;
  v_total numeric;
  v_paid numeric;
BEGIN
  v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

  IF v_invoice_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT COALESCE(total_usd,0) INTO v_total
  FROM public.invoices
  WHERE id = v_invoice_id;

  SELECT COALESCE(SUM(amount_usd),0) INTO v_paid
  FROM public.payments
  WHERE invoice_id = v_invoice_id
    AND payment_status = 'paid'::payment_status;

  UPDATE public.invoices
     SET paid_usd = v_paid,
         amount_paid = v_paid,
         status = CASE WHEN v_paid >= v_total - 0.001 THEN 'paid'
                       WHEN v_paid > 0 THEN 'partial'
                       ELSE 'unpaid' END
   WHERE id = v_invoice_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

UPDATE public.invoices i
SET paid_usd = COALESCE(p.paid, 0),
    amount_paid = COALESCE(p.paid, 0),
    status = CASE WHEN COALESCE(p.paid, 0) >= COALESCE(i.total_usd, 0) - 0.001 THEN 'paid'
                  WHEN COALESCE(p.paid, 0) > 0 THEN 'partial'
                  ELSE 'unpaid' END
FROM (
  SELECT invoice_id, SUM(amount_usd) AS paid
  FROM public.payments
  WHERE invoice_id IS NOT NULL
    AND payment_status = 'paid'::payment_status
  GROUP BY invoice_id
) p
WHERE i.id = p.invoice_id;

UPDATE public.invoices i
SET paid_usd = 0,
    amount_paid = 0,
    status = 'unpaid'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.payments p
  WHERE p.invoice_id = i.id
    AND p.payment_status = 'paid'::payment_status
);