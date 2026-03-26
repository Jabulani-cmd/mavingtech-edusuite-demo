
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'expenses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'fee_structures'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.fee_structures;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'invoice_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.invoice_items;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'student_restrictions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.student_restrictions;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'bank_transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bank_transactions;
  END IF;
END $$;
