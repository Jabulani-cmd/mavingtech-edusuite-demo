
-- Add 'registration' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'registration';

-- Enable realtime for online_payments
ALTER PUBLICATION supabase_realtime ADD TABLE public.online_payments;

-- Create a function to auto-reflect completed online payments into student accounts
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

        -- Create payment record
        INSERT INTO payments (
          student_id, invoice_id, amount_usd, amount_zig,
          payment_method, receipt_number, reference_number, notes
        ) VALUES (
          v_student_id, v_invoice_id, NEW.amount_usd, 0,
          'online', v_receipt_number, NEW.id::text,
          'Online payment via Stripe - ' || COALESCE(NEW.payer_name, 'N/A')
        );

        -- Update invoice paid amount
        UPDATE invoices
        SET paid_usd = paid_usd + NEW.amount_usd,
            status = CASE
              WHEN (paid_usd + NEW.amount_usd) >= total_usd THEN 'paid'
              ELSE 'partial'
            END
        WHERE id = v_invoice_id;

        -- Link payment to student record
        UPDATE online_payments SET student_id = v_student_id WHERE id = NEW.id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create receipt sequence if not exists
CREATE SEQUENCE IF NOT EXISTS public.payment_receipt_seq START WITH 100001;

-- Create trigger on online_payments
DROP TRIGGER IF EXISTS trg_process_online_payment ON public.online_payments;
CREATE TRIGGER trg_process_online_payment
  AFTER INSERT OR UPDATE ON public.online_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.process_online_payment();
