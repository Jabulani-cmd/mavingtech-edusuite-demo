-- ============================================
-- DEMO LOADERS THAT RUN ON THE LIVE DATABASE
-- Loading the demo on the live database failed in two places:
-- * seed_demo_finance: "UPDATE requires a WHERE clause". The live database refuses any UPDATE or DELETE
--   without a WHERE clause (the pg_safeupdate safety setting); the first version had UPDATEs without one.
-- * seed_demo_activity: 'missing FROM-clause entry for table "s"'. The last insert (homework marks) used a
--   join followed by a LATERAL sub-select; it is rewritten with a plain sub-select.
-- Both functions are replaced. Every UPDATE and DELETE has a WHERE, and each step is named, so a failure
-- now says which step failed (for example "Demo activity failed while adding class test marks: ...").
-- Idempotent: safe to run more than once.
-- ============================================

CREATE OR REPLACE FUNCTION public.seed_demo_activity()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  step text := 'checking permission';
  n_att integer; n_marks integer; n_hw integer; n_subs integer;
BEGIN
  IF NOT public.is_school_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only a school administrator can load demo activity' USING ERRCODE = '42501';
  END IF;

  step := 'finding the demo learners';
  DROP TABLE IF EXISTS pg_temp.demo_learners;
  DROP TABLE IF EXISTS pg_temp.demo_hw;
  CREATE TEMP TABLE demo_learners ON COMMIT DROP AS
  SELECT DISTINCT ON (st.id) st.id AS student_id, sc.class_id,
    ('x' || substr(md5(st.id::text || 'att'), 1, 7))::bit(28)::int % 100 AS h_att,
    ('x' || substr(md5(st.id::text || 'mark'), 1, 7))::bit(28)::int % 100 AS h_mark,
    ('x' || substr(md5(st.id::text || 'hw'), 1, 7))::bit(28)::int % 100 AS h_hw
  FROM public.students st JOIN public.student_classes sc ON sc.student_id = st.id
  WHERE lower(st.email) LIKE '%schooldemo.com'
  ORDER BY st.id, sc.created_at DESC;

  step := 'removing earlier demo activity';
  DELETE FROM public.attendance a USING demo_learners d WHERE a.student_id = d.student_id AND a.notes = 'demo-activity';
  DELETE FROM public.marks m USING demo_learners d WHERE m.student_id = d.student_id AND m.comment = 'demo-activity';
  DELETE FROM public.assessments WHERE description = 'demo-activity';

  -- Attendance: school days in the last 8 weeks (not today). About 4% absent normally;
  -- learners in the attendance group (5%) miss about 45% of days in the last 4 weeks.
  step := 'adding attendance';
  INSERT INTO public.attendance (student_id, class_id, date, status, notes)
  SELECT d.student_id, d.class_id, day::date,
    CASE WHEN ('x' || substr(md5(d.student_id::text || day::text), 1, 7))::bit(28)::int % 100
              < CASE WHEN d.h_att < 5 AND day >= current_date - 28 THEN 45 ELSE 4 END
         THEN 'absent' ELSE 'present' END,
    'demo-activity'
  FROM demo_learners d, generate_series(current_date - 56, current_date - 1, interval '1 day') AS day
  WHERE extract(isodow FROM day) < 6;
  GET DIAGNOSTICS n_att = ROW_COUNT;

  -- Class tests 7, 21, 35 and 49 days ago in every subject the class takes. Learners in the marks group (5%)
  -- drop about 20 points in the two most recent tests. A teacher whose login is not linked yet is replaced by
  -- the administrator running the load (marks.teacher_id cannot be empty).
  step := 'adding class test marks';
  INSERT INTO public.marks (student_id, subject_id, class_id, teacher_id, assessment_type, mark, out_of, term, academic_year, comment, created_at)
  SELECT d.student_id, cs.subject_id, d.class_id, COALESCE(tch.user_id, auth.uid()), 'Class test',
    greatest(5, least(98,
      45 + ('x' || substr(md5(d.student_id::text || cs.subject_id::text), 1, 7))::bit(28)::int % 40
      + ('x' || substr(md5(d.student_id::text || cs.subject_id::text || ago::text), 1, 7))::bit(28)::int % 9 - 4
      - CASE WHEN d.h_mark < 5 AND ago <= 21 THEN 20 ELSE 0 END)),
    100, 'Term 3', extract(year FROM current_date)::text, 'demo-activity', now() - make_interval(days => ago)
  FROM demo_learners d
  JOIN public.class_subjects cs ON cs.class_id = d.class_id
  LEFT JOIN public.staff tch ON tch.id = cs.teacher_id
  CROSS JOIN unnest(ARRAY[49, 35, 21, 7]) AS ago;
  GET DIAGNOSTICS n_marks = ROW_COUNT;

  -- Homework: three pieces per class, due 30, 20 and 10 days ago. The most recent one
  -- has no marks entered yet, so the agent can flag it to the teacher.
  step := 'creating homework';
  CREATE TEMP TABLE demo_hw ON COMMIT DROP AS
  SELECT gen_random_uuid() AS id, c.id AS class_id, first_cs.subject_id, COALESCE(tch.user_id, auth.uid()) AS teacher_id, n,
    (current_date - (40 - n * 10))::date AS due
  FROM public.classes c
  JOIN (SELECT DISTINCT ON (x.class_id) x.class_id, x.subject_id, x.teacher_id
          FROM public.class_subjects x ORDER BY x.class_id, x.created_at, x.id) first_cs ON first_cs.class_id = c.id
  LEFT JOIN public.staff tch ON tch.id = first_cs.teacher_id
  CROSS JOIN generate_series(1, 3) AS n
  WHERE EXISTS (SELECT 1 FROM demo_learners d WHERE d.class_id = c.id);

  INSERT INTO public.assessments (id, title, description, class_id, subject_id, teacher_id, assessment_type, due_date, total_marks, max_marks, is_published)
  SELECT id, 'Homework ' || n, 'demo-activity', class_id, subject_id, teacher_id, 'assignment', due, 20, 20, true FROM demo_hw;
  GET DIAGNOSTICS n_hw = ROW_COUNT;

  -- Hand-ins: learners in the homework group (8%) miss two of three; others miss 3%.
  step := 'adding homework hand-ins';
  INSERT INTO public.assessment_submissions (assessment_id, student_id, status, notes, submitted_at, submission_date)
  SELECT h.id, d.student_id, 'submitted', 'demo-activity', h.due - 1, h.due - 1
  FROM demo_hw h JOIN demo_learners d ON d.class_id = h.class_id
  WHERE NOT (d.h_hw < 8 AND h.n >= 2)
    AND ('x' || substr(md5(d.student_id::text || h.id::text), 1, 7))::bit(28)::int % 100 >= 3;
  GET DIAGNOSTICS n_subs = ROW_COUNT;

  -- Marks for the two older pieces of homework (a plain sub-select, no LATERAL).
  step := 'adding homework marks';
  INSERT INTO public.assessment_results (assessment_id, student_id, mark, percentage, is_published, graded_date)
  SELECT sub.assessment_id, sub.student_id, sub.m, round(sub.m * 5.0, 1), true, sub.due + 3
  FROM (
    SELECT sb.assessment_id, sb.student_id, h.due,
           8 + (('x' || substr(md5(sb.student_id::text || sb.assessment_id::text), 1, 7))::bit(28)::int % 12) AS m
    FROM public.assessment_submissions sb
    JOIN demo_hw h ON h.id = sb.assessment_id
    WHERE h.n < 3
  ) sub;

  RETURN jsonb_build_object('attendance', n_att, 'marks', n_marks, 'homework', n_hw, 'hand_ins', n_subs);
EXCEPTION
  WHEN insufficient_privilege THEN RAISE;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Demo activity failed while %: %', step, SQLERRM USING ERRCODE = SQLSTATE;
END $$;
REVOKE ALL ON FUNCTION public.seed_demo_activity() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seed_demo_activity() TO authenticated, service_role;

-- ---------- Demo finance (demo school only) ----------
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
  DELETE FROM public.payments WHERE notes = 'demo-finance';
  DELETE FROM public.invoices WHERE notes = 'demo-finance';
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
