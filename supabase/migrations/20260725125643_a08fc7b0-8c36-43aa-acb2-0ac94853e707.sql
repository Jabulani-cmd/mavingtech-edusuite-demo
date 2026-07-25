UPDATE public.payments
SET amount_usd = amount,
    currency = 'ZAR'
WHERE payment_status = 'paid'::payment_status
  AND invoice_id IS NOT NULL
  AND COALESCE(amount, 0) > 0
  AND COALESCE(amount_usd, 0) = 0;

UPDATE public.invoices AS inv
SET paid_usd = COALESCE(paid.total_paid, 0),
    amount_paid = COALESCE(paid.total_paid, 0),
    status = CASE WHEN COALESCE(paid.total_paid, 0) >= COALESCE(inv.total_usd, inv.amount_usd, 0) - 0.001 THEN 'paid'
                  WHEN COALESCE(paid.total_paid, 0) > 0 THEN 'partial'
                  ELSE 'unpaid' END
FROM (
  SELECT i.id AS invoice_id,
         COALESCE(SUM(COALESCE(NULLIF(p.amount_usd, 0), p.amount, 0)) FILTER (WHERE p.payment_status = 'paid'::payment_status), 0) AS total_paid
  FROM public.invoices i
  LEFT JOIN public.payments p ON p.invoice_id = i.id
  GROUP BY i.id
) AS paid
WHERE inv.id = paid.invoice_id;