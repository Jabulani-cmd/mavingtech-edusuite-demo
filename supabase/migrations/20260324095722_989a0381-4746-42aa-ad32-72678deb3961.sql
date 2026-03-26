-- Global invoice/payment consistency: make payments the source of truth

-- 1) Recalculate helper
CREATE OR REPLACE FUNCTION public.recalculate_invoice_payment_totals(p_invoice_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_paid_usd numeric := 0;
  v_total_paid_zig numeric := 0;
BEGIN
  IF p_invoice_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(amount_usd), 0), COALESCE(SUM(amount_zig), 0)
  INTO v_total_paid_usd, v_total_paid_zig
  FROM public.payments
  WHERE invoice_id = p_invoice_id;

  UPDATE public.invoices i
  SET
    paid_usd = v_total_paid_usd,
    paid_zig = v_total_paid_zig,
    status = CASE
      WHEN i.status = 'voided' THEN i.status
      WHEN v_total_paid_usd >= i.total_usd THEN 'paid'
      WHEN v_total_paid_usd > 0 OR v_total_paid_zig > 0 THEN 'partial'
      ELSE 'unpaid'
    END
  WHERE i.id = p_invoice_id;
END;
$$;

-- 2) Trigger function on payments changes
CREATE OR REPLACE FUNCTION public.handle_payment_totals_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_invoice_payment_totals(OLD.invoice_id);
    RETURN OLD;
  END IF;

  -- INSERT / UPDATE
  PERFORM public.recalculate_invoice_payment_totals(NEW.invoice_id);

  -- If payment moved between invoices, recalc previous invoice too
  IF TG_OP = 'UPDATE' AND NEW.invoice_id IS DISTINCT FROM OLD.invoice_id THEN
    PERFORM public.recalculate_invoice_payment_totals(OLD.invoice_id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_invoice_totals_on_payments ON public.payments;
CREATE TRIGGER trg_sync_invoice_totals_on_payments
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_payment_totals_sync();

-- 3) Ensure online payment processing does not double-update invoices
CREATE OR REPLACE FUNCTION public.process_online_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_student_id uuid;
  v_invoice_id uuid;
  v_receipt_number text;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') AND NEW.payment_type = 'fees' THEN
    -- Look up student by student_number (admission_number)
    SELECT id INTO v_student_id
    FROM students
    WHERE admission_number = NEW.student_number
    LIMIT 1;

    IF v_student_id IS NOT NULL THEN
      -- Find the latest unpaid/partial invoice for this student
      SELECT id INTO v_invoice_id
      FROM invoices
      WHERE student_id = v_student_id
        AND status IN ('unpaid', 'partial')
      ORDER BY created_at DESC
      LIMIT 1;

      IF v_invoice_id IS NOT NULL THEN
        -- Generate receipt number
        v_receipt_number := 'ONL-' || LPAD(nextval('payment_receipt_seq'::regclass)::text, 6, '0');

        -- Create payment record (invoice totals now sync automatically via payment trigger)
        INSERT INTO payments (
          student_id, invoice_id, amount_usd, amount_zig,
          payment_method, receipt_number, reference_number, notes
        ) VALUES (
          v_student_id, v_invoice_id, NEW.amount_usd, 0,
          'online', v_receipt_number, NEW.id::text,
          'Online payment via Stripe - ' || COALESCE(NEW.payer_name, 'N/A')
        );

        -- Link payment to student record
        UPDATE online_payments SET student_id = v_student_id WHERE id = NEW.id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 4) Backfill existing invoices to match actual payments (keep voided invoices untouched)
UPDATE public.invoices i
SET
  paid_usd = COALESCE(p.sum_usd, 0),
  paid_zig = COALESCE(p.sum_zig, 0),
  status = CASE
    WHEN i.status = 'voided' THEN i.status
    WHEN COALESCE(p.sum_usd, 0) >= i.total_usd THEN 'paid'
    WHEN COALESCE(p.sum_usd, 0) > 0 OR COALESCE(p.sum_zig, 0) > 0 THEN 'partial'
    ELSE 'unpaid'
  END
FROM (
  SELECT invoice_id, SUM(amount_usd) AS sum_usd, SUM(amount_zig) AS sum_zig
  FROM public.payments
  GROUP BY invoice_id
) p
WHERE i.id = p.invoice_id;

UPDATE public.invoices i
SET
  paid_usd = 0,
  paid_zig = 0,
  status = CASE WHEN i.status = 'voided' THEN i.status ELSE 'unpaid' END
WHERE NOT EXISTS (
  SELECT 1 FROM public.payments p WHERE p.invoice_id = i.id
)
AND i.status <> 'voided';