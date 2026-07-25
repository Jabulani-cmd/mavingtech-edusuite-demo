CREATE OR REPLACE FUNCTION public.prepare_payment_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_finance_admin(auth.uid()) THEN
    NEW.parent_id := auth.uid();
    NEW.recorded_by := COALESCE(NEW.recorded_by, auth.uid());
  END IF;

  IF NEW.currency IS NULL OR NEW.currency = 'USD' THEN
    NEW.currency := 'ZAR';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prepare_payment_owner ON public.payments;
CREATE TRIGGER trg_prepare_payment_owner
BEFORE INSERT ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.prepare_payment_owner();

DROP POLICY IF EXISTS pay_parent_insert ON public.payments;

CREATE POLICY pay_parent_insert
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_finance_admin(auth.uid())
  OR (
    parent_id = auth.uid()
    AND (
      (
        student_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.parent_students ps
          WHERE ps.parent_id = auth.uid()
            AND ps.student_id = payments.student_id
        )
      )
      OR (
        invoice_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.invoices i
          JOIN public.parent_students ps ON ps.student_id = i.student_id
          WHERE i.id = payments.invoice_id
            AND ps.parent_id = auth.uid()
        )
      )
      OR (
        subscription_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.subscriptions s
          WHERE s.id = payments.subscription_id
            AND s.parent_id = auth.uid()
        )
      )
    )
  )
);