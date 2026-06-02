
-- ============ INVOICES: add fields used by code ============
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS total_usd numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_zig numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_usd  numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_zig  numeric NOT NULL DEFAULT 0;

UPDATE public.invoices SET total_usd = COALESCE(amount_usd,0) WHERE total_usd = 0;
UPDATE public.invoices SET paid_usd  = COALESCE(amount_paid,0) WHERE paid_usd  = 0;

-- keep amount_usd / amount_paid in sync with total_usd / paid_usd
CREATE OR REPLACE FUNCTION public.invoices_sync_amounts()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.amount_usd  := COALESCE(NEW.total_usd, NEW.amount_usd, 0);
  NEW.amount_paid := COALESCE(NEW.paid_usd,  NEW.amount_paid, 0);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_invoices_sync_amounts ON public.invoices;
CREATE TRIGGER trg_invoices_sync_amounts
  BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.invoices_sync_amounts();

-- ============ INVOICE_ITEMS: add USD/ZiG + fee_structure_id ============
ALTER TABLE public.invoice_items
  ADD COLUMN IF NOT EXISTS amount_usd numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_zig numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_structure_id uuid;

UPDATE public.invoice_items SET amount_usd = COALESCE(amount,0) WHERE amount_usd = 0;

CREATE OR REPLACE FUNCTION public.invoice_items_sync_amount()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.amount := COALESCE(NEW.amount_usd, NEW.amount, 0);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_invoice_items_sync_amount ON public.invoice_items;
CREATE TRIGGER trg_invoice_items_sync_amount
  BEFORE INSERT OR UPDATE ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.invoice_items_sync_amount();

-- ============ PAYMENTS: add fields used by fee tabs ============
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS student_id uuid,
  ADD COLUMN IF NOT EXISTS invoice_id uuid,
  ADD COLUMN IF NOT EXISTS amount_usd numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_zig numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_date date NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS reference_number text,
  ADD COLUMN IF NOT EXISTS payment_notes text;

-- amount stays in sync with amount_usd; payment_method enum already exists
CREATE OR REPLACE FUNCTION public.payments_sync_amount()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.amount IS NULL OR NEW.amount = 0 THEN
    NEW.amount := COALESCE(NEW.amount_usd, 0);
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_payments_sync_amount ON public.payments;
CREATE TRIGGER trg_payments_sync_amount
  BEFORE INSERT OR UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.payments_sync_amount();

-- ============ TERM_REGISTRATIONS: add missing fields ============
ALTER TABLE public.term_registrations
  ADD COLUMN IF NOT EXISTS subjects text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS boarding_status text DEFAULT 'day',
  ADD COLUMN IF NOT EXISTS registered_by uuid,
  ADD COLUMN IF NOT EXISTS invoice_id uuid;

ALTER TABLE public.term_registrations ALTER COLUMN status SET DEFAULT 'registered';
UPDATE public.term_registrations SET status='registered' WHERE status IS NULL OR status='pending';

-- ============ HOMEWORK: add form/stream/file fields ============
ALTER TABLE public.homework
  ADD COLUMN IF NOT EXISTS form text,
  ADD COLUMN IF NOT EXISTS stream text,
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS instructions text;

-- ============ ASSESSMENTS: add form/stream/file/published fields ============
ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS form text,
  ADD COLUMN IF NOT EXISTS stream text,
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS instructions text,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS max_marks numeric;

-- ============ HOMEWORK_SUBMISSIONS ============
CREATE TABLE IF NOT EXISTS public.homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id uuid NOT NULL REFERENCES public.homework(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  file_url text,
  notes text,
  status text NOT NULL DEFAULT 'submitted',
  UNIQUE(homework_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homework_submissions TO authenticated;
GRANT ALL ON public.homework_submissions TO service_role;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY hw_sub_read   ON public.homework_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY hw_sub_write  ON public.homework_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ LEARNING_MATERIALS ============
CREATE TABLE IF NOT EXISTS public.learning_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid,
  subject_id uuid,
  class_id uuid,
  form text,
  stream text,
  title text NOT NULL,
  description text,
  file_url text,
  file_name text,
  external_link text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_materials TO authenticated;
GRANT ALL ON public.learning_materials TO service_role;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY lm_read  ON public.learning_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY lm_write ON public.learning_materials FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['teacher'::app_role,'hod'::app_role]) OR is_school_admin(auth.uid()))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['teacher'::app_role,'hod'::app_role]) OR is_school_admin(auth.uid()));

-- ============ Realtime ============
DO $$ BEGIN
  PERFORM 1; -- ignore errors if already added
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.homework; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.assessments; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.homework_submissions; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_materials; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.access_grants; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.term_registrations; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
