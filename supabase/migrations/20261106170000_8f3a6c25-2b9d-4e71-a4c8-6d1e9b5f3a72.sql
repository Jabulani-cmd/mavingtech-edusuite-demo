-- ============================================
-- DEMO FEES: ONE SET OF INVOICES PER LEARNER
-- The database creates an invoice automatically whenever a student is added. seed_demo_finance only removed
-- the invoices it had made itself, so each demo learner ended up with that automatic invoice as well as the
-- demo ones. It now replaces every invoice and payment of the demo learners (learners whose e-mail is on the
-- demo domain); real learners are never touched.
-- Idempotent: safe to run more than once.
-- ============================================

CREATE OR REPLACE FUNCTION public.seed_demo_finance()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  step text := 'checking permission';
  yr text := extract(year FROM current_date)::text;
  zig_rate numeric := 27;
  n_fees integer; n_inv integer; n_pay integer;
BEGIN
  IF NOT public.is_school_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only a school administrator can load demo finance data' USING ERRCODE = '42501';
  END IF;

  step := 'removing earlier demo finance data';
  -- Term registrations, reminders and bank lines point at the invoices and payments being replaced.
  PERFORM public.demo_forget(ARRAY['payment_reminders', 'term_registrations', 'bank_transactions']);
  -- The demo learners are demo-only, so every invoice and payment of theirs goes, including the invoice the database
  -- creates automatically for each new student. Without this each learner ended up with two sets of invoices.
  DELETE FROM public.payments WHERE notes = 'demo-finance'
    OR student_id IN (SELECT st.id FROM public.students st WHERE lower(st.email) LIKE '%schooldemo.com');
  DELETE FROM public.invoices WHERE notes = 'demo-finance'
    OR student_id IN (SELECT st.id FROM public.students st WHERE lower(st.email) LIKE '%schooldemo.com');
  DELETE FROM public.fee_structures WHERE description LIKE 'DEMO %';

  -- Fee structures for the two most recent terms. Every row names a form and a boarding status (neither
  -- can be empty): day learners pay tuition; boarders pay the same tuition plus a boarding fee.
  step := 'adding fee structures';
  INSERT INTO public.fee_structures (academic_year, term, form, boarding_status, description, amount_usd, amount_zig, is_active)
  SELECT yr, t.term, 'Form ' || f, b.status,
         CASE WHEN b.fee THEN 'DEMO Boarding Form ' || f ELSE 'DEMO Tuition Form ' || f || CASE WHEN b.status = 'boarding' THEN ' (boarders)' ELSE '' END END,
         CASE WHEN b.fee THEN 320 WHEN f >= 5 THEN 240 ELSE 180 END,
         (CASE WHEN b.fee THEN 320 WHEN f >= 5 THEN 240 ELSE 180 END) * zig_rate, true
  FROM generate_series(1, 6) AS f,
       (VALUES ('Term 2'), ('Term 3')) AS t(term),
       (VALUES ('day', false), ('boarding', false), ('boarding', true)) AS b(status, fee);
  SELECT count(*) INTO n_fees FROM public.fee_structures WHERE description LIKE 'DEMO %';

  -- One row per demo learner per term, with the amount due and the amount paid worked out in one statement
  -- (no UPDATE on a work table, so nothing here needs a WHERE clause).
  step := 'working out invoices';
  DROP TABLE IF EXISTS pg_temp.demo_inv;
  CREATE TEMP TABLE demo_inv ON COMMIT DROP AS
  WITH base AS (
    SELECT gen_random_uuid() AS id, s.id AS student_id, t.term, s.boarding_status,
           row_number() OVER (PARTITION BY t.term ORDER BY s.admission_number) AS rn,
           coalesce(s.form, 'Form 1') AS form,
           ('x' || substr(md5(s.id::text || t.term), 1, 7))::bit(28)::int % 100 AS h,
           ('x' || substr(md5(s.id::text || t.term || 'part'), 1, 7))::bit(28)::int % 30 AS h_part,
           t.due AS due
    FROM public.students s
    CROSS JOIN (VALUES ('Term 2', current_date - 75), ('Term 3', current_date - 12)) AS t(term, due)
    WHERE lower(s.email) LIKE '%schooldemo.com'
  ), priced AS (
    SELECT b.*,
           (SELECT coalesce(sum(fs.amount_usd), 0) FROM public.fee_structures fs
             WHERE fs.description LIKE 'DEMO %' AND fs.term = b.term
               AND fs.form = b.form AND fs.boarding_status = b.boarding_status) AS total_usd,
           -- Term 2 is mostly settled; Term 3 (current, past its due date) has a realistic spread of debtors.
           CASE WHEN b.term = 'Term 2' THEN CASE WHEN b.h < 85 THEN 'paid' WHEN b.h < 95 THEN 'partial' ELSE 'unpaid' END
                ELSE CASE WHEN b.h < 45 THEN 'paid' WHEN b.h < 75 THEN 'partial' ELSE 'unpaid' END END AS status
    FROM base b
  )
  SELECT p.id, p.student_id, p.term, p.rn, p.h, p.due, p.total_usd, p.status,
         CASE p.status WHEN 'paid' THEN p.total_usd
                       WHEN 'partial' THEN round(p.total_usd * (0.4 + p.h_part / 100.0), 0)
                       ELSE 0 END AS paid_usd
  FROM priced p
  WHERE p.total_usd > 0;

  step := 'adding invoices';
  INSERT INTO public.invoices (id, invoice_number, student_id, academic_year, term, total_usd, total_zig, amount_usd, amount_paid,
                               paid_usd, paid_zig, status, due_date, currency, notes)
  SELECT d.id, 'DEMO-' || right(yr, 2) || '-' || replace(d.term, 'Term ', 'T') || '-' || lpad(d.rn::text, 4, '0'),
         d.student_id, yr, d.term, d.total_usd, d.total_usd * zig_rate, d.total_usd, d.paid_usd, d.paid_usd, d.paid_usd * zig_rate,
         d.status, d.due, 'USD', 'demo-finance'
  FROM demo_inv d;
  GET DIAGNOSTICS n_inv = ROW_COUNT;

  step := 'adding invoice lines';
  INSERT INTO public.invoice_items (invoice_id, fee_structure_id, description, amount, amount_usd, amount_zig)
  SELECT d.id, fs.id, fs.description, fs.amount_usd, fs.amount_usd, fs.amount_zig
  FROM demo_inv d
  JOIN public.students s ON s.id = d.student_id
  JOIN public.fee_structures fs
    ON fs.description LIKE 'DEMO %' AND fs.term = d.term
   AND fs.form = coalesce(s.form, 'Form 1') AND fs.boarding_status = s.boarding_status;

  -- One receipt per invoice that has had money paid on it.
  step := 'adding payments';
  INSERT INTO public.payments (invoice_id, student_id, parent_id, amount, amount_usd, amount_zig, currency, payment_date,
                               payment_method, payment_status, receipt_number, reference_number, notes, recorded_by)
  SELECT d.id, d.student_id,
         (SELECT ps.parent_id FROM public.parent_students ps WHERE ps.student_id = d.student_id ORDER BY ps.created_at LIMIT 1),
         d.paid_usd, d.paid_usd, d.paid_usd * zig_rate, 'USD',
         (d.due - 5 - (d.h % 20))::date,
         (ARRAY['ecocash', 'bank_transfer', 'manual', 'onemoney'])[1 + d.h % 4]::public.payment_method,
         'paid'::public.payment_status,
         'RCT-DEMO-' || right(yr, 2) || '-' || replace(d.term, 'Term ', 'T') || '-' || lpad(d.rn::text, 4, '0'),
         'REF' || upper(substr(md5(d.id::text), 1, 8)), 'demo-finance', auth.uid()
  FROM demo_inv d WHERE d.paid_usd > 0;
  GET DIAGNOSTICS n_pay = ROW_COUNT;

  RETURN jsonb_build_object('fee_structures', n_fees, 'invoices', n_inv, 'payments', n_pay);
EXCEPTION
  WHEN insufficient_privilege THEN RAISE;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Demo finance failed while %: %', step, SQLERRM USING ERRCODE = SQLSTATE;
END $$;
REVOKE ALL ON FUNCTION public.seed_demo_finance() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seed_demo_finance() TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
