-- Make invoice_id nullable on payments table to allow advance payments
ALTER TABLE public.payments ALTER COLUMN invoice_id DROP NOT NULL;

-- Drop the existing foreign key and re-add with ON DELETE SET NULL
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_invoice_id_fkey;
ALTER TABLE public.payments ADD CONSTRAINT payments_invoice_id_fkey 
  FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;