
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START WITH 100001;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS fee_structure_id uuid REFERENCES public.fee_structures(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.build_invoice_for_student(_student_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  s RECORD; v_fee RECORD;
  v_invoice_id uuid; v_invoice_number text; v_existing uuid;
  v_year text; v_term text; v_month int; v_boarding text; v_grade text; v_due date;
BEGIN
  SELECT * INTO s FROM public.students WHERE id=_student_id;
  IF NOT FOUND THEN RETURN NULL; END IF;
  v_grade := COALESCE(s.form, s.class);
  IF v_grade IS NULL OR v_grade='' THEN RETURN NULL; END IF;
  v_boarding := COALESCE(s.boarding_status, 'day');
  v_year := to_char(CURRENT_DATE,'YYYY');
  v_month := EXTRACT(MONTH FROM CURRENT_DATE)::int;
  v_term := CASE WHEN v_month BETWEEN 1 AND 4 THEN 'Term 1'
                 WHEN v_month BETWEEN 5 AND 8 THEN 'Term 2'
                 ELSE 'Term 3' END;
  v_due := CASE WHEN v_month BETWEEN 1 AND 4 THEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int,2,28)
                WHEN v_month BETWEEN 5 AND 8 THEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int,6,30)
                ELSE make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int,10,31) END;
  IF v_due < CURRENT_DATE THEN v_due := CURRENT_DATE + INTERVAL '30 days'; END IF;

  SELECT * INTO v_fee FROM public.fee_structures
   WHERE form=v_grade AND term=v_term AND academic_year=v_year AND boarding_status=v_boarding
   ORDER BY created_at DESC LIMIT 1;
  IF v_fee.id IS NULL THEN
    SELECT * INTO v_fee FROM public.fee_structures
     WHERE form=v_grade AND term=v_term AND academic_year=v_year
     ORDER BY created_at DESC LIMIT 1;
  END IF;
  IF v_fee.id IS NULL THEN
    SELECT * INTO v_fee FROM public.fee_structures
     WHERE form=v_grade AND boarding_status=v_boarding
     ORDER BY academic_year DESC, created_at DESC LIMIT 1;
    v_term := COALESCE(v_fee.term, v_term); v_year := COALESCE(v_fee.academic_year, v_year);
  END IF;
  IF v_fee.id IS NULL THEN
    SELECT * INTO v_fee FROM public.fee_structures
     WHERE form=v_grade ORDER BY created_at DESC LIMIT 1;
    v_term := COALESCE(v_fee.term, v_term); v_year := COALESCE(v_fee.academic_year, v_year);
  END IF;
  IF v_fee.id IS NULL THEN RETURN NULL; END IF;

  SELECT id INTO v_existing FROM public.invoices
   WHERE student_id=_student_id
     AND COALESCE(academic_year,'')=COALESCE(v_year,'')
     AND COALESCE(term,'')=COALESCE(v_term,'')
   LIMIT 1;
  IF v_existing IS NOT NULL THEN RETURN v_existing; END IF;

  v_invoice_number := 'INV-' || v_year || '-' || LPAD(nextval('public.invoice_number_seq')::text,6,'0');

  INSERT INTO public.invoices (
    invoice_number, student_id, fee_structure_id, academic_year, term,
    amount_usd, total_usd, amount_paid, paid_usd, currency, status, due_date, notes
  ) VALUES (
    v_invoice_number, _student_id, v_fee.id, v_year, v_term,
    v_fee.amount_usd, v_fee.amount_usd, 0, 0, 'ZAR', 'unpaid', v_due,
    'Auto-generated on student registration'
  ) RETURNING id INTO v_invoice_id;

  INSERT INTO public.invoice_items (invoice_id, fee_structure_id, description, amount, amount_usd)
  VALUES (v_invoice_id, v_fee.id,
          v_term || ' ' || v_year || ' — ' || v_grade || ' (' || v_boarding || ') tuition',
          v_fee.amount_usd, v_fee.amount_usd);

  RETURN v_invoice_id;
END $fn$;

CREATE OR REPLACE FUNCTION public.auto_invoice_student()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$ BEGIN PERFORM public.build_invoice_for_student(NEW.id); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_auto_invoice_student ON public.students;
CREATE TRIGGER trg_auto_invoice_student
  AFTER INSERT ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.auto_invoice_student();

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT s.id FROM public.students s
           LEFT JOIN public.invoices i ON i.student_id=s.id
           WHERE i.id IS NULL
  LOOP
    PERFORM public.build_invoice_for_student(r.id);
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
