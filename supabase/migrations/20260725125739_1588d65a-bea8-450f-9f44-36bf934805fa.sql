DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT id FROM public.invoices LOOP
    PERFORM public.recalculate_invoice_payment_totals(r.id);
  END LOOP;
END $$;