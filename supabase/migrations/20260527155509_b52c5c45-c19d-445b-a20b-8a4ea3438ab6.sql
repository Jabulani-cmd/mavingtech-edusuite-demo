-- Auto-invoice students on registration based on fee structure
CREATE OR REPLACE FUNCTION public.auto_invoice_student()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_fee RECORD;
  v_invoice_id uuid;
  v_invoice_number text;
  v_existing uuid;
BEGIN
  IF NEW.form IS NULL OR NEW.form = '' THEN
    RETURN NEW;
  END IF;

  -- Find the latest matching active fee structure for this form + boarding status
  SELECT * INTO v_fee
  FROM public.fee_structures
  WHERE form = NEW.form
    AND (boarding_status IS NULL OR boarding_status = COALESCE(NEW.boarding_status, 'day'))
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_fee.id IS NULL THEN
    -- Fallback: any fee structure matching the form
    SELECT * INTO v_fee
    FROM public.fee_structures
    WHERE form = NEW.form
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  IF v_fee.id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Avoid duplicating an invoice for the same student/term/year
  SELECT id INTO v_existing
  FROM public.invoices
  WHERE student_id = NEW.id
    AND COALESCE(academic_year,'') = COALESCE(v_fee.academic_year,'')
    AND COALESCE(term,'') = COALESCE(v_fee.term,'')
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_invoice_number := 'INV-' || to_char(now(),'YYYYMMDD') || '-' || substr(replace(NEW.id::text,'-',''),1,6);

  INSERT INTO public.invoices (
    invoice_number, student_id, academic_year, term,
    amount_usd, amount_paid, currency, status, due_date, notes
  ) VALUES (
    v_invoice_number, NEW.id, v_fee.academic_year, v_fee.term,
    v_fee.amount_usd, 0, 'USD', 'pending',
    CURRENT_DATE + INTERVAL '30 days',
    'Auto-generated on registration'
  ) RETURNING id INTO v_invoice_id;

  INSERT INTO public.invoice_items (invoice_id, description, amount)
  VALUES (
    v_invoice_id,
    COALESCE(v_fee.term,'Term') || ' ' || COALESCE(v_fee.academic_year,'') || ' - ' || NEW.form || ' (' || COALESCE(NEW.boarding_status,'day') || ') fees',
    v_fee.amount_usd
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_invoice_student ON public.students;
CREATE TRIGGER trg_auto_invoice_student
  AFTER INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_invoice_student();