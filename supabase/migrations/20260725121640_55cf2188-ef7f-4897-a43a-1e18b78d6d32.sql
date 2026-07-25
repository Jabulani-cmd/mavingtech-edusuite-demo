
CREATE OR REPLACE FUNCTION public.sync_invoice_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total numeric;
  v_paid numeric;
BEGIN
  IF NEW.invoice_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT COALESCE(total_usd,0) INTO v_total FROM public.invoices WHERE id = NEW.invoice_id;
  SELECT COALESCE(SUM(amount_usd),0) INTO v_paid FROM public.payments WHERE invoice_id = NEW.invoice_id;
  UPDATE public.invoices
     SET paid_usd = v_paid,
         status = CASE WHEN v_paid >= v_total - 0.001 THEN 'paid'
                       WHEN v_paid > 0 THEN 'partial'
                       ELSE 'unpaid' END
   WHERE id = NEW.invoice_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_invoice_on_payment ON public.payments;
CREATE TRIGGER trg_sync_invoice_on_payment
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_on_payment();
