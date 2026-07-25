
-- 1) Force payment_status='paid' when a parent/non-admin records a payment via the portal.
--    The parent portal only inserts on gateway success; the enum default of 'pending' was
--    being applied (due to column-privilege scoping) which prevented sync_invoice_on_payment
--    from updating the invoice.
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
    -- Parent portal only records successful gateway payments; ensure status reflects that.
    IF NEW.payment_status IS NULL OR NEW.payment_status = 'pending'::payment_status THEN
      NEW.payment_status := 'paid'::payment_status;
    END IF;
  END IF;

  IF NEW.currency IS NULL OR NEW.currency = 'USD' THEN
    NEW.currency := 'ZAR';
  END IF;

  RETURN NEW;
END;
$$;

-- 2) Backfill: any stuck 'pending' payments that already have an invoice_id should be paid.
UPDATE public.payments
SET payment_status = 'paid'::payment_status
WHERE payment_status = 'pending'::payment_status
  AND invoice_id IS NOT NULL;

-- 3) Re-sync all invoice totals from actual paid payments (self-heal after backfill).
UPDATE public.invoices i
SET paid_usd = sub.paid,
    amount_paid = sub.paid,
    status = CASE
      WHEN sub.paid >= COALESCE(i.total_usd,0) - 0.001 THEN 'paid'
      WHEN sub.paid > 0 THEN 'partial'
      ELSE 'unpaid'
    END
FROM (
  SELECT invoice_id, COALESCE(SUM(amount_usd),0) AS paid
  FROM public.payments
  WHERE payment_status = 'paid'::payment_status AND invoice_id IS NOT NULL
  GROUP BY invoice_id
) sub
WHERE i.id = sub.invoice_id;

-- 4) Enable realtime so all portals reflect payment/invoice changes without refresh.
ALTER TABLE public.payments REPLICA IDENTITY FULL;
ALTER TABLE public.invoices REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
