DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_invoice_id_fkey'
      AND conrelid = 'public.payments'::regclass
      AND NOT convalidated
  ) THEN
    ALTER TABLE public.payments VALIDATE CONSTRAINT payments_invoice_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_student_id_fkey'
      AND conrelid = 'public.payments'::regclass
      AND NOT convalidated
  ) THEN
    ALTER TABLE public.payments VALIDATE CONSTRAINT payments_student_id_fkey;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';