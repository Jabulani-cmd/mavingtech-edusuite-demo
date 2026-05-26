
-- 1. Expand the finance-admin helper to include the Bursar (and senior school admins).
CREATE OR REPLACE FUNCTION public.is_finance_admin(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid
      AND role IN (
        'admin'::app_role,
        'supervisor'::app_role,
        'bursar'::app_role,
        'admin_supervisor'::app_role,
        'principal'::app_role,
        'deputy_principal'::app_role
      )
  );
$$;

-- 2. Allow finance admins (incl. Bursar) to manage approval requests.
DROP POLICY IF EXISTS finance_admin_manage_approvals ON public.finance_approval_requests;
CREATE POLICY finance_admin_manage_approvals
  ON public.finance_approval_requests
  FOR ALL TO authenticated
  USING (public.is_finance_admin(auth.uid()))
  WITH CHECK (public.is_finance_admin(auth.uid()));

-- 3. Allow finance admins (incl. Bursar) to read the audit trail.
DROP POLICY IF EXISTS finance_admin_read_audit ON public.audit_logs;
CREATE POLICY finance_admin_read_audit
  ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_finance_admin(auth.uid()));

-- 4. Allow finance admins (incl. Bursar) to manage the finance tables that
--    approved actions need to touch when executing voids / deletes.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'expenses',
    'invoices',
    'invoice_items',
    'fee_structures'
  ]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS finance_admin_manage_%I ON public.%I;',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY finance_admin_manage_%I ON public.%I
         FOR ALL TO authenticated
         USING (public.is_finance_admin(auth.uid()))
         WITH CHECK (public.is_finance_admin(auth.uid()));',
      t, t
    );
  END LOOP;
END$$;

-- 5. Same treatment for petty_cash / payments / supplier_invoices if they exist.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['petty_cash','payments','supplier_invoices'] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('DROP POLICY IF EXISTS finance_admin_manage_%I ON public.%I;', t, t);
      EXECUTE format(
        'CREATE POLICY finance_admin_manage_%I ON public.%I
           FOR ALL TO authenticated
           USING (public.is_finance_admin(auth.uid()))
           WITH CHECK (public.is_finance_admin(auth.uid()));',
        t, t
      );
    END IF;
  END LOOP;
END$$;
