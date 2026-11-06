-- ============================================
-- COMPLETE DEMO SCHOOL: EVERY AREA HAS DATA TO SHOW
-- seed_demo_activity and seed_demo_finance load marks, attendance, homework, fees, invoices and
-- payments. This adds the rest, in four areas so that no single call runs long:
--   academic  exams, exam results, report cards, exam timetable, class materials, homework, lesson plans
--   finance   expenses, petty cash, supplier invoices and payments, approval requests, bank
--             transactions (matched and unmatched), payment reminders, term registrations
--   boarding  hostels, rooms, bed allocations, health visits, textbook issues, inventory
--   school    announcements, events, meetings, awards, projects, facilities, sports fixtures, downloads,
--             carousel and gallery, appointments, messages, SMS templates, enquiries, staff leave, notifications
-- seed_demo_school_life(area) replaces what it created earlier for that area, and reports what it
-- loaded and any step that failed (one failing step never stops the others).
-- clear_demo_school_life() removes everything these functions created.
-- Everything is tracked in demo_seed_rows, so only demo rows are ever replaced or removed.
-- Administrators only. Every UPDATE and DELETE has a WHERE clause.
-- Idempotent: safe to run more than once.
-- ============================================

CREATE TABLE IF NOT EXISTS public.demo_seed_rows (
  seq bigserial PRIMARY KEY,
  table_name text NOT NULL,
  row_id uuid NOT NULL
);
CREATE INDEX IF NOT EXISTS demo_seed_rows_table_idx ON public.demo_seed_rows (table_name);
ALTER TABLE public.demo_seed_rows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.demo_seed_rows FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.demo_seed_rows TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.demo_seed_rows_seq_seq TO service_role;

-- Removes the demo rows previously created in the named tables, newest first (children before parents).
CREATE OR REPLACE FUNCTION public.demo_forget(_tables text[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT table_name, array_agg(row_id) AS ids, max(seq) AS last_seq
    FROM public.demo_seed_rows WHERE table_name = ANY(_tables) GROUP BY table_name ORDER BY max(seq) DESC
  LOOP
    BEGIN
      EXECUTE format('DELETE FROM public.%I WHERE id = ANY($1)', r.table_name) USING r.ids;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- a table that no longer exists or a row still in use: leave it, the registry entry is dropped below
    END;
  END LOOP;
  DELETE FROM public.demo_seed_rows WHERE table_name = ANY(_tables);
END $$;
REVOKE ALL ON FUNCTION public.demo_forget(text[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.demo_forget(text[]) TO service_role;

CREATE OR REPLACE FUNCTION public.clear_demo_school_life()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n bigint;
BEGIN
  IF NOT public.is_school_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only a school administrator can clear demo data' USING ERRCODE = '42501';
  END IF;
  SELECT count(*) INTO n FROM public.demo_seed_rows;
  PERFORM public.demo_forget(ARRAY(SELECT DISTINCT table_name FROM public.demo_seed_rows));
  RETURN jsonb_build_object('removed', n);
END $$;
REVOKE ALL ON FUNCTION public.clear_demo_school_life() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.clear_demo_school_life() TO authenticated, service_role;

-- seed_demo_finance again, now that the helper above exists: it first removes the demo term registrations,
-- payment reminders and bank lines that point at the invoices and payments it replaces. Without this, loading
-- the demo a second time failed with a foreign key error.
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


CREATE OR REPLACE FUNCTION public.seed_demo_school_life(_area text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  adm uuid := auth.uid();
  yr text := extract(year FROM current_date)::text;
  zig numeric := 27;
  step text;
  n bigint;
  loaded jsonb := '{}'::jsonb;
  failed jsonb := '[]'::jsonb;
BEGIN
  IF NOT public.is_school_admin(adm) THEN
    RAISE EXCEPTION 'Only a school administrator can load demo data' USING ERRCODE = '42501';
  END IF;
  IF _area NOT IN ('academic', 'finance', 'boarding', 'school') THEN
    RAISE EXCEPTION 'Unknown demo area %', _area;
  END IF;

  -- The demo learners (one class each) and the subjects each class takes, used by several areas.
  DROP TABLE IF EXISTS pg_temp.dl;
  DROP TABLE IF EXISTS pg_temp.dcs;
  CREATE TEMP TABLE dl ON COMMIT DROP AS
  SELECT DISTINCT ON (st.id) st.id AS student_id, sc.class_id, st.form, st.gender, st.boarding_status, st.admission_number, st.full_name,
         ('x' || substr(md5(st.id::text), 1, 7))::bit(28)::int % 30 AS ability
  FROM public.students st JOIN public.student_classes sc ON sc.student_id = st.id
  WHERE lower(st.email) LIKE '%schooldemo.com'
  ORDER BY st.id, sc.created_at DESC;
  CREATE TEMP TABLE dcs ON COMMIT DROP AS
  SELECT cs.class_id, cs.subject_id, c.name AS class_name, c.level, c.stream, sb.name AS subject_name,
         COALESCE(t.user_id, adm) AS teacher_uid, t.id AS staff_id,
         row_number() OVER (PARTITION BY cs.class_id ORDER BY sb.name) AS rn
  FROM public.class_subjects cs
  JOIN public.classes c ON c.id = cs.class_id
  JOIN public.subjects sb ON sb.id = cs.subject_id
  LEFT JOIN public.staff t ON t.id = cs.teacher_id
  WHERE c.level LIKE 'Form %' AND EXISTS (SELECT 1 FROM dl WHERE dl.class_id = cs.class_id);

  -- =========================== ACADEMIC ===========================
  IF _area = 'academic' THEN
    PERFORM public.demo_forget(ARRAY['term_reports', 'exam_results', 'exam_timetable_entries', 'exams', 'study_materials', 'homework', 'lesson_plans']);

    step := 'exams';
    BEGIN
      WITH ins AS (
        INSERT INTO public.exams (name, academic_year, term, exam_type, form_level, start_date, end_date, is_published, subject_ids)
        SELECT t.nm || ' - Form ' || f, yr, t.term, 'End of term', 'Form ' || f, t.s, t.e, t.pub,
               (SELECT array_agg(DISTINCT x.subject_id) FROM dcs x WHERE x.level = 'Form ' || f)
        FROM generate_series(1, 6) f,
             (VALUES ('Term 2 End of Term Examinations', 'Term 2', (current_date - 60)::date, (current_date - 50)::date, true),
                     ('Term 3 End of Term Examinations', 'Term 3', (current_date + 21)::date, (current_date + 32)::date, false)) AS t(nm, term, s, e, pub)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'exams', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'exam results';
    BEGIN
      WITH ins AS (
        INSERT INTO public.exam_results (exam_id, student_id, subject_id, mark, grade, comment, uploaded_by)
        SELECT sc.exam_id, sc.student_id, sc.subject_id, sc.mark,
               CASE WHEN sc.mark >= 75 THEN 'A' WHEN sc.mark >= 65 THEN 'B' WHEN sc.mark >= 50 THEN 'C' WHEN sc.mark >= 40 THEN 'D' WHEN sc.mark >= 30 THEN 'E' ELSE 'U' END,
               CASE WHEN sc.mark >= 75 THEN 'Excellent work' WHEN sc.mark >= 65 THEN 'Very good' WHEN sc.mark >= 50 THEN 'Satisfactory' WHEN sc.mark >= 40 THEN 'Needs more effort' ELSE 'Please see the teacher' END,
               adm
        FROM (
          SELECT e.id AS exam_id, d.student_id, x.subject_id,
                 greatest(8, least(98, 36 + d.ability + (('x' || substr(md5(d.student_id::text || x.subject_id::text), 1, 7))::bit(28)::int % 26))) AS mark
          FROM dl d
          JOIN dcs x ON x.class_id = d.class_id
          JOIN public.exams e ON e.form_level = d.form AND e.term = 'Term 2' AND e.academic_year = yr
                             AND e.id IN (SELECT row_id FROM public.demo_seed_rows WHERE table_name = 'exams')
        ) sc
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'exam_results', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'report cards';
    BEGIN
      WITH avg_marks AS (
        SELECT er.student_id, d.class_id, d.form, round(avg(er.mark), 1) AS avg_mark, sum(er.mark) AS total
        FROM public.exam_results er JOIN dl d ON d.student_id = er.student_id
        WHERE er.id IN (SELECT row_id FROM public.demo_seed_rows WHERE table_name = 'exam_results')
        GROUP BY er.student_id, d.class_id, d.form),
      ranked AS (
        SELECT a.*, rank() OVER (PARTITION BY a.class_id ORDER BY a.avg_mark DESC) AS class_rank, count(*) OVER (PARTITION BY a.class_id) AS class_size,
               rank() OVER (PARTITION BY a.form ORDER BY a.avg_mark DESC) AS form_rank, count(*) OVER (PARTITION BY a.form) AS form_size
        FROM avg_marks a),
      ins AS (
        INSERT INTO public.term_reports (student_id, academic_year, term, form_level, average_mark, total_marks, class_rank, class_size, form_rank, form_size,
                                         overall_grade, class_teacher_comment, head_comment, is_published, generated_at, generated_by)
        SELECT r.student_id, yr, 'Term 2', r.form, r.avg_mark, r.total, r.class_rank, r.class_size, r.form_rank, r.form_size,
               CASE WHEN r.avg_mark >= 75 THEN 'A' WHEN r.avg_mark >= 65 THEN 'B' WHEN r.avg_mark >= 50 THEN 'C' WHEN r.avg_mark >= 40 THEN 'D' ELSE 'E' END,
               CASE WHEN r.avg_mark >= 75 THEN 'An outstanding term. Keep it up.' WHEN r.avg_mark >= 60 THEN 'A good term with steady progress.' WHEN r.avg_mark >= 45 THEN 'Fair results. More revision will help.' ELSE 'Below expectations. Extra support is recommended.' END,
               CASE WHEN r.avg_mark >= 60 THEN 'Well done. Continue to aim high.' ELSE 'We encourage regular attendance and homework.' END,
               true, now(), adm
        FROM ranked r
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'term_reports', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'exam timetable';
    BEGIN
      WITH monday AS (SELECT date_trunc('week', current_date + 28)::date AS d),
      papers AS (
        SELECT x.class_id, x.subject_id, e.id AS exam_id, row_number() OVER (PARTITION BY x.class_id ORDER BY x.subject_name) - 1 AS k
        FROM dcs x JOIN public.exams e ON e.form_level = x.level AND e.term = 'Term 3' AND e.academic_year = yr
                                      AND e.id IN (SELECT row_id FROM public.demo_seed_rows WHERE table_name = 'exams')),
      ins AS (
        INSERT INTO public.exam_timetable_entries (exam_id, class_id, subject_id, exam_date, start_time, end_time, venue, invigilators, notes)
        SELECT p.exam_id, p.class_id, p.subject_id, m.d + ((((p.k / 2) / 5) * 7 + ((p.k / 2) % 5))::int),
               (CASE WHEN p.k % 2 = 0 THEN '08:30' ELSE '11:00' END)::time, (CASE WHEN p.k % 2 = 0 THEN '10:30' ELSE '13:00' END)::time,
               CASE WHEN p.k % 3 = 0 THEN 'School Hall' ELSE 'Classroom' END, ARRAY['Invigilator on duty'], 'Bring your own stationery and calculator'
        FROM papers p, monday m
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'exam_timetable_entries', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'class materials';
    BEGIN
      WITH ins AS (
        INSERT INTO public.study_materials (title, description, class_id, subject_id, teacher_id, material_type, link_url, is_published, tags)
        SELECT x.subject_name || ' revision notes: ' || x.class_name,
               'Notes, worked examples and practice questions for ' || x.subject_name || '. Prepared by your subject teacher.',
               x.class_id, x.subject_id, x.teacher_uid, 'link',
               CASE WHEN x.subject_name ILIKE '%math%' THEN 'https://www.khanacademy.org/math'
                    WHEN x.subject_name ILIKE '%english%' THEN 'https://www.bbc.co.uk/bitesize/subjects/zvbbkqt'
                    WHEN x.subject_name ILIKE '%science%' OR x.subject_name ILIKE '%physics%' OR x.subject_name ILIKE '%chemistry%' OR x.subject_name ILIKE '%biology%' THEN 'https://www.khanacademy.org/science'
                    WHEN x.subject_name ILIKE '%computer%' THEN 'https://www.khanacademy.org/computing'
                    WHEN x.subject_name ILIKE '%account%' OR x.subject_name ILIKE '%business%' OR x.subject_name ILIKE '%econom%' OR x.subject_name ILIKE '%commerce%' THEN 'https://www.khanacademy.org/economics-finance-domain'
                    ELSE 'https://www.zimsec.co.zw/' END,
               true, ARRAY[x.subject_name, 'revision']
        FROM dcs x
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'study_materials', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'homework';
    BEGIN
      WITH ins AS (
        INSERT INTO public.homework (title, description, instructions, class_id, subject_id, teacher_id, due_date, form, stream)
        SELECT x.subject_name || ': exercise set ' || (1 + x.rn % 3),
               'Complete the exercises from your class notes.', 'Show your working. Hand in on the due date.',
               x.class_id, x.subject_id, x.teacher_uid, (current_date + 2 + (x.rn % 10)::int)::date, x.level, x.stream
        FROM dcs x
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'homework', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'lesson plans';
    BEGIN
      WITH one AS (SELECT DISTINCT ON (x.teacher_uid) x.* FROM dcs x WHERE x.staff_id IS NOT NULL ORDER BY x.teacher_uid, x.subject_name),
      ins AS (
        INSERT INTO public.lesson_plans (title, class_id, subject_id, teacher_id, date, academic_year, term, week_number, duration_minutes,
                                         objectives, introduction, main_activity, conclusion, assessment_strategy, homework_notes, materials_needed, status)
        SELECT o.subject_name || ': next topic for ' || o.class_name, o.class_id, o.subject_id, o.teacher_uid, (current_date + 2)::date, yr, 'Term 3',
               extract(week FROM current_date)::int, 45,
               'By the end of the lesson learners can explain the key ideas and solve basic problems.',
               'Recap of the previous lesson with three quick questions.', 'Worked examples on the board followed by guided practice in pairs.',
               'Summary of the main points and a short exit question.', 'Observation and a five-question quiz.',
               'Exercise set from the class notes.', 'Textbook, chalkboard, worksheets', 'planned'
        FROM one o
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'lesson_plans', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;
  END IF;

  -- =========================== FINANCE ===========================
  IF _area = 'finance' THEN
    PERFORM public.demo_forget(ARRAY['payment_reminders', 'term_registrations', 'bank_transactions', 'finance_approval_requests', 'supplier_payments', 'supplier_invoices', 'petty_cash', 'expenses']);

    step := 'expenses';
    BEGIN
      WITH ins AS (
        INSERT INTO public.expenses (description, category, amount_usd, amount_zig, expense_date, payment_method, reference_number, recorded_by)
        SELECT c.item || CASE WHEN c.i % 3 = 0 THEN ' (monthly)' ELSE '' END, c.cat, c.amt, c.amt * zig, (current_date - (c.i * 2))::date,
               (ARRAY['bank_transfer', 'cash', 'ecocash'])[1 + c.i % 3], 'EXP-' || lpad(c.i::text, 4, '0'), adm
        FROM (
          SELECT i,
                 (ARRAY['Electricity', 'Water and sewerage', 'Classroom repairs', 'Stationery and printing', 'School bus fuel', 'Kitchen supplies',
                        'Sports equipment', 'Science laboratory chemicals', 'Internet and Wi-Fi', 'Garden and grounds', 'Security services', 'Cleaning materials'])[1 + i % 12] AS item,
                 (ARRAY['Utilities', 'Utilities', 'Maintenance', 'Stationery', 'Transport', 'Catering', 'Sports', 'Laboratory', 'ICT', 'Maintenance', 'Security', 'Cleaning'])[1 + i % 12] AS cat,
                 40 + (('x' || substr(md5('exp' || i::text), 1, 7))::bit(28)::int % 900) AS amt
          FROM generate_series(1, 40) i
        ) c
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'expenses', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'petty cash';
    BEGIN
      WITH ins AS (
        INSERT INTO public.petty_cash (description, amount_usd, amount_zig, transaction_date, transaction_type, reference_number, recorded_by)
        SELECT CASE WHEN i % 5 = 0 THEN 'Float top-up from the bursar' ELSE (ARRAY['Tea and sugar for the staffroom', 'Photocopying for exams', 'Bus fare for the sports team', 'Cleaning supplies', 'Stamps and courier'])[1 + i % 5] END,
               CASE WHEN i % 5 = 0 THEN 200 ELSE 5 + (i % 7) * 4 END, (CASE WHEN i % 5 = 0 THEN 200 ELSE 5 + (i % 7) * 4 END) * zig,
               (current_date - (i * 3))::date, CASE WHEN i % 5 = 0 THEN 'deposit' ELSE 'withdrawal' END, 'PC-' || lpad(i::text, 4, '0'), adm
        FROM generate_series(1, 20) i
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'petty_cash', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'supplier invoices';
    BEGIN
      WITH ins AS (
        INSERT INTO public.supplier_invoices (supplier_name, supplier_contact, invoice_number, invoice_date, due_date, description, amount_usd, amount_zig, paid_usd, paid_zig, status, recorded_by)
        SELECT s.nm, s.contact, 'SUP-' || yr || '-' || lpad(s.i::text, 3, '0'), (current_date - (s.i * 9))::date, (current_date - (s.i * 9) + 30)::date, s.dsc,
               s.amt, s.amt * zig, CASE s.i % 3 WHEN 0 THEN s.amt WHEN 1 THEN round(s.amt / 2) ELSE 0 END, (CASE s.i % 3 WHEN 0 THEN s.amt WHEN 1 THEN round(s.amt / 2) ELSE 0 END) * zig,
               CASE s.i % 3 WHEN 0 THEN 'paid' WHEN 1 THEN 'partial' ELSE 'unpaid' END, adm
        FROM (VALUES
          (1, 'Zimpapers Stationery', 'accounts@zimpapers.example', 'Exercise books and printing paper', 620),
          (2, 'Harare Fresh Produce', 'orders@freshproduce.example', 'Fresh vegetables for the kitchen', 1450),
          (3, 'TelOne Business', 'sales@telone.example', 'Internet connection', 380),
          (4, 'ZESA Holdings', 'billing@zesa.example', 'Electricity for the month', 2100),
          (5, 'Dairibord Zimbabwe', 'orders@dairibord.example', 'Milk and dairy for boarders', 760),
          (6, 'Mukuvisi Hardware', 'sales@mukuvisi.example', 'Plumbing and building supplies', 910),
          (7, 'Greenfield Uniforms', 'orders@greenfield.example', 'School uniform stock', 1320),
          (8, 'Techzim Computers', 'sales@techzim.example', 'Laptop servicing', 540),
          (9, 'Sable Chemicals', 'orders@sable.example', 'Laboratory chemicals', 480),
          (10, 'Pioneer Transport', 'bookings@pioneer.example', 'Hire of the school bus', 700)) AS s(i, nm, contact, dsc, amt)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'supplier_invoices', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'supplier payments';
    BEGIN
      WITH ins AS (
        INSERT INTO public.supplier_payments (supplier_invoice_id, amount_usd, amount_zig, payment_date, payment_method, reference, notes, recorded_by)
        SELECT si.id, si.paid_usd, si.paid_zig, (si.invoice_date + 12)::date, 'bank_transfer', 'TRF' || upper(substr(md5(si.id::text), 1, 8)),
               CASE WHEN si.status = 'paid' THEN 'Paid in full' ELSE 'Part payment' END, adm
        FROM public.supplier_invoices si
        WHERE si.id IN (SELECT row_id FROM public.demo_seed_rows WHERE table_name = 'supplier_invoices') AND si.paid_usd > 0
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'supplier_payments', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'approval requests';
    BEGIN
      WITH ins AS (
        INSERT INTO public.finance_approval_requests (request_type, description, amount_usd, status, requested_by, review_notes, reviewed_at, reviewed_by)
        SELECT q.rt, q.dsc, q.amt, q.st, adm,
               CASE q.st WHEN 'approved' THEN 'Approved within budget' WHEN 'rejected' THEN 'Not in the term budget. Please resubmit next term.' ELSE NULL END,
               CASE WHEN q.st <> 'pending' THEN now() - interval '2 days' END, CASE WHEN q.st <> 'pending' THEN adm END
        FROM (VALUES
          ('expense', 'Repair the Form 3 classroom roof', 1250, 'pending'),
          ('expense', 'Replace laboratory fume cupboard', 2400, 'pending'),
          ('fee_waiver', 'Fee waiver request for a learner whose family lost income', 180, 'pending'),
          ('refund', 'Refund of a duplicate payment', 90, 'approved'),
          ('supplier_payment', 'Pay Mukuvisi Hardware balance', 455, 'approved'),
          ('expense', 'New projector for the computer lab', 780, 'approved'),
          ('fee_waiver', 'Partial waiver for a staff member''s child', 120, 'approved'),
          ('expense', 'Staff retreat catering', 650, 'rejected')) AS q(rt, dsc, amt, st)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'finance_approval_requests', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'bank transactions';
    BEGIN
      WITH matched_credits AS (
        SELECT 'Deposit: ' || coalesce(p.receipt_number, 'receipt') AS description, p.amount_usd AS usd, p.payment_date::date AS dt, 'credit' AS ty, 'reconciled' AS st, p.id AS pid, NULL::uuid AS eid
        FROM public.payments p WHERE p.notes = 'demo-finance' ORDER BY p.payment_date DESC LIMIT 25),
      matched_debits AS (
        SELECT 'Payment: ' || e.description, e.amount_usd, e.expense_date::date, 'debit', 'reconciled', NULL::uuid, e.id
        FROM public.expenses e WHERE e.id IN (SELECT row_id FROM public.demo_seed_rows WHERE table_name = 'expenses') ORDER BY e.expense_date DESC LIMIT 10),
      unmatched AS (
        SELECT CASE WHEN g % 2 = 0 THEN 'Unidentified deposit' ELSE 'Bank charges and fees' END, (20 + g * 13)::numeric,
               (current_date - g * 4)::date, CASE WHEN g % 2 = 0 THEN 'credit' ELSE 'debit' END, 'unreconciled', NULL::uuid, NULL::uuid
        FROM generate_series(1, 8) g),
      allrows AS (SELECT * FROM matched_credits UNION ALL SELECT * FROM matched_debits UNION ALL SELECT * FROM unmatched),
      ins AS (
        INSERT INTO public.bank_transactions (description, amount_usd, amount_zig, transaction_date, transaction_type, reconciliation_status, matched_payment_id, matched_expense_id,
                                              bank_name, account_number, reference_number, recorded_by)
        SELECT a.description, a.usd, a.usd * zig, a.dt, a.ty, a.st, a.pid, a.eid, 'CBZ Bank', '0123456789', 'BNK' || upper(substr(md5(a.description || a.dt::text || a.usd::text), 1, 8)), adm
        FROM allrows a
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'bank_transactions', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'payment reminders';
    BEGIN
      WITH owing AS (
        SELECT DISTINCT ON (i.student_id) i.student_id, ps.parent_id, i.total_usd - i.paid_usd AS balance, i.term
        FROM public.invoices i
        JOIN public.parent_students ps ON ps.student_id = i.student_id
        WHERE i.notes = 'demo-finance' AND i.term = 'Term 3' AND i.status <> 'paid'
        ORDER BY i.student_id, ps.created_at LIMIT 12),
      ins AS (
        INSERT INTO public.payment_reminders (parent_id, student_id, reminder_type, delivery_method, status, sent_at, ai_generated_message, created_by)
        SELECT o.parent_id, o.student_id, 'overdue_fees', 'sms', 'sent', now() - (o.n || ' days')::interval,
               'Dear parent, a balance of US$ ' || o.balance || ' is outstanding on the ' || o.term || ' fees. Please pay at the bursar''s office or by EcoCash. Thank you.', adm
        FROM (SELECT o2.*, row_number() OVER (ORDER BY o2.student_id) AS n FROM owing o2) o
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'payment_reminders', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'term registrations';
    BEGIN
      WITH ins AS (
        INSERT INTO public.term_registrations (student_id, academic_year, term, status, boarding_status, amount_due, amount_paid, invoice_id, registered_at, registered_by, subjects)
        SELECT d.student_id, yr, 'Term 3', 'registered', d.boarding_status, i.total_usd, i.paid_usd, i.id, now() - interval '30 days', adm,
               (SELECT array_agg(x.subject_name ORDER BY x.subject_name) FROM dcs x WHERE x.class_id = d.class_id)
        FROM dl d
        LEFT JOIN public.invoices i ON i.student_id = d.student_id AND i.term = 'Term 3' AND i.notes = 'demo-finance'
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'term_registrations', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;
  END IF;

  -- =========================== BOARDING ===========================
  IF _area = 'boarding' THEN
    PERFORM public.demo_forget(ARRAY['textbook_issues', 'health_visits', 'bed_allocations', 'rooms', 'hostels', 'inventory_transactions', 'inventory_items', 'inventory_categories']);

    step := 'hostels';
    BEGIN
      WITH ins AS (
        INSERT INTO public.hostels (name, gender, capacity, description, location, matron, phone, is_active)
        SELECT h.nm, h.gender, 60, h.dsc, h.loc, h.matron, h.phone, true
        FROM (VALUES ('Mutasa House', 'male', 'Boys boarding house', 'Block A, east of the sports field', 'Mr. Dumisani Ncube', '+263772100001'),
                     ('Chirwa House', 'female', 'Girls boarding house', 'Block B, next to the library', 'Mrs. Patience Moyo', '+263772100002')) AS h(nm, gender, dsc, loc, matron, phone)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'hostels', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'rooms';
    BEGIN
      WITH ins AS (
        INSERT INTO public.rooms (hostel_id, room_number, capacity, floor, room_type, notes)
        SELECT h.id, (CASE WHEN h.name = 'Mutasa House' THEN 'M' ELSE 'C' END) || lpad(g::text, 2, '0'), 6, CASE WHEN g <= 5 THEN 0 ELSE 1 END, 'dormitory', 'Six beds, lockers and a study desk'
        FROM public.hostels h, generate_series(1, 10) g
        WHERE h.id IN (SELECT row_id FROM public.demo_seed_rows WHERE table_name = 'hostels')
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'rooms', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'bed allocations';
    BEGIN
      WITH boarders AS (
        SELECT d.student_id, d.gender, row_number() OVER (PARTITION BY d.gender ORDER BY d.admission_number) - 1 AS k
        FROM dl d WHERE d.boarding_status = 'boarding'),
      ins AS (
        INSERT INTO public.bed_allocations (student_id, room_id, bed_number, academic_year, status, allocation_start_date)
        SELECT b.student_id, r.id, 'Bed ' || ((b.k % 6) + 1), yr, 'active', (yr || '-01-12')::date
        FROM boarders b
        JOIN public.hostels h ON h.name = CASE WHEN b.gender = 'Male' THEN 'Mutasa House' ELSE 'Chirwa House' END
                              AND h.id IN (SELECT row_id FROM public.demo_seed_rows WHERE table_name = 'hostels')
        JOIN public.rooms r ON r.hostel_id = h.id AND r.room_number = (CASE WHEN b.gender = 'Male' THEN 'M' ELSE 'C' END) || lpad(((b.k / 6) + 1)::text, 2, '0')
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'bed_allocations', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'health visits';
    BEGIN
      WITH pick AS (SELECT d.student_id, row_number() OVER (ORDER BY md5(d.student_id::text)) AS n FROM dl d),
      ins AS (
        INSERT INTO public.health_visits (student_id, visit_date, symptoms, diagnosis, treatment, medication_given, parent_notified, notes, follow_up_date)
        SELECT p.student_id, (current_date - ((p.n * 2)::int))::date, v.sym, v.dx, v.tx, v.med, (p.n % 3) <> 0, 'Seen by the school nurse', CASE WHEN p.n % 4 = 0 THEN (current_date + 3)::date END
        FROM pick p JOIN (VALUES
            (1, 'Headache and tiredness', 'Mild dehydration', 'Rest and fluids', 'Paracetamol'),
            (2, 'Sore throat', 'Throat infection', 'Warm drinks, rest', 'Throat lozenges'),
            (3, 'Stomach ache', 'Indigestion', 'Light meal and rest', 'Antacid'),
            (4, 'Cut on the knee', 'Minor wound', 'Cleaned and dressed', 'Antiseptic'),
            (5, 'Fever', 'Suspected flu', 'Rest, monitored, parent called', 'Paracetamol')) AS v(k, sym, dx, tx, med) ON v.k = 1 + (p.n % 5)::int
        WHERE p.n <= 15
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'health_visits', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'inventory categories';
    BEGIN
      WITH ins AS (
        INSERT INTO public.inventory_categories (name, description)
        SELECT c.nm, c.dsc FROM (VALUES ('Textbooks', 'Textbooks issued to learners'), ('Stationery', 'Books, paper and writing materials'), ('Laboratory', 'Chemicals and apparatus'), ('Sports', 'Balls, kit and equipment'),
                                        ('Furniture', 'Desks, chairs and cupboards'), ('ICT', 'Computers and accessories')) AS c(nm, dsc)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'inventory_categories', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'inventory items';
    BEGIN
      WITH ins AS (
        INSERT INTO public.inventory_items (name, category_id, item_code, quantity, reorder_level, unit, location, supplier, purchase_price_usd, purchase_price_zig)
        SELECT i.nm, c.id, 'INV-' || lpad(i.n::text, 3, '0'), i.qty, i.reorder, i.unit, i.loc, i.sup, i.price, i.price * zig
        FROM (VALUES
          (1, 'A4 printing paper (ream)', 'Stationery', 120, 40, 'ream', 'Stores', 'Zimpapers Stationery', 6.5),
          (2, 'Exercise books 72 page', 'Stationery', 900, 300, 'each', 'Stores', 'Zimpapers Stationery', 0.6),
          (3, 'Whiteboard markers', 'Stationery', 35, 40, 'box', 'Stores', 'Zimpapers Stationery', 4.0),
          (4, 'Chalk (box of 100)', 'Stationery', 18, 10, 'box', 'Stores', 'Zimpapers Stationery', 2.5),
          (5, 'Test tubes', 'Laboratory', 200, 60, 'each', 'Science lab', 'Sable Chemicals', 0.4),
          (6, 'Bunsen burners', 'Laboratory', 12, 6, 'each', 'Science lab', 'Sable Chemicals', 18.0),
          (7, 'Hydrochloric acid 1L', 'Laboratory', 4, 5, 'bottle', 'Science lab', 'Sable Chemicals', 22.0),
          (8, 'Microscope slides', 'Laboratory', 500, 100, 'each', 'Science lab', 'Sable Chemicals', 0.1),
          (9, 'Footballs', 'Sports', 14, 8, 'each', 'Sports store', 'Sports Direct Harare', 15.0),
          (10, 'Netballs', 'Sports', 9, 8, 'each', 'Sports store', 'Sports Direct Harare', 14.0),
          (11, 'Athletics hurdles', 'Sports', 20, 10, 'each', 'Sports store', 'Sports Direct Harare', 30.0),
          (12, 'Student desks', 'Furniture', 350, 40, 'each', 'Classrooms', 'Mukuvisi Hardware', 28.0),
          (13, 'Student chairs', 'Furniture', 360, 40, 'each', 'Classrooms', 'Mukuvisi Hardware', 12.0),
          (14, 'Staffroom cupboards', 'Furniture', 6, 2, 'each', 'Staffroom', 'Mukuvisi Hardware', 95.0),
          (15, 'Desktop computers', 'ICT', 58, 5, 'each', 'Computer labs', 'Techzim Computers', 320.0),
          (16, 'Projectors', 'ICT', 6, 2, 'each', 'Classrooms', 'Techzim Computers', 410.0),
          (17, 'HDMI cables', 'ICT', 8, 10, 'each', 'Stores', 'Techzim Computers', 5.0),
          (18, 'Printer toner', 'ICT', 3, 4, 'each', 'Office', 'Techzim Computers', 55.0),
          (19, 'Mathematics textbook', 'Textbooks', 520, 60, 'each', 'Library', 'Zimpapers Stationery', 9.0),
          (20, 'English textbook', 'Textbooks', 480, 60, 'each', 'Library', 'Zimpapers Stationery', 8.0),
          (21, 'Combined Science textbook', 'Textbooks', 410, 60, 'each', 'Library', 'Zimpapers Stationery', 11.0),
          (22, 'Shona textbook', 'Textbooks', 450, 60, 'each', 'Library', 'Zimpapers Stationery', 7.0)) AS i(n, nm, cat, qty, reorder, unit, loc, sup, price)
        JOIN public.inventory_categories c ON c.name = i.cat AND c.id IN (SELECT row_id FROM public.demo_seed_rows WHERE table_name = 'inventory_categories')
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'inventory_items', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'inventory movements';
    BEGIN
      WITH items AS (SELECT it.id, row_number() OVER (ORDER BY it.item_code) AS n FROM public.inventory_items it
                     WHERE it.id IN (SELECT row_id FROM public.demo_seed_rows WHERE table_name = 'inventory_items')),
      ins AS (
        INSERT INTO public.inventory_transactions (item_id, transaction_type, quantity, reference, notes, recorded_by)
        SELECT i.id, CASE WHEN g % 3 = 0 THEN 'in' ELSE 'out' END, 2 + ((i.n * g) % 20),
               CASE WHEN g % 3 = 0 THEN 'Delivery note DN-' || lpad((i.n * 10 + g)::text, 4, '0') ELSE 'Issued to ' || (ARRAY['Form 1A', 'Science department', 'Sports department', 'Administration', 'Form 4C'])[1 + g % 5] END,
               CASE WHEN g % 3 = 0 THEN 'Restocked' ELSE 'Term use' END, adm
        FROM items i, generate_series(1, 3) g
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'inventory_transactions', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'textbook issues';
    BEGIN
      WITH ins AS (
        INSERT INTO public.textbook_issues (student_id, inventory_item_id, book_title, issued_date, due_date, status, condition, returned_date, condition_on_return, fine_amount_usd, fine_amount_zig)
        SELECT d.student_id, tb.id, tb.name || ', ' || d.form, (current_date - 60)::date, (current_date + 30)::date,
               CASE WHEN d.ability % 5 = 0 THEN 'returned' ELSE 'issued' END, 'good',
               CASE WHEN d.ability % 5 = 0 THEN (current_date - 5)::date END, CASE WHEN d.ability % 5 = 0 THEN 'good' END,
               CASE WHEN d.ability % 11 = 0 THEN 2 ELSE 0 END, CASE WHEN d.ability % 11 = 0 THEN 2 * zig ELSE 0 END
        FROM dl d
        JOIN (SELECT it.id, it.name, row_number() OVER (ORDER BY it.name) - 1 AS k FROM public.inventory_items it
              WHERE it.name LIKE '%textbook' AND it.id IN (SELECT row_id FROM public.demo_seed_rows WHERE table_name = 'inventory_items')) tb
          ON tb.k = d.ability % 4
        WHERE d.ability % 4 = 0 OR d.ability % 7 = 0
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'textbook_issues', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;
  END IF;

  -- =========================== SCHOOL LIFE ===========================
  IF _area = 'school' THEN
    PERFORM public.demo_forget(ARRAY['notifications', 'leave_requests', 'contact_messages', 'sms_templates', 'parent_communication_logs', 'communication_logs', 'appointments',
                                     'gallery_images', 'carousel_images', 'downloads', 'sports_schedule', 'facilities', 'school_projects', 'awards', 'meetings', 'events', 'announcements']);

    step := 'announcements';
    BEGIN
      WITH ins AS (
        INSERT INTO public.announcements (title, content, category, is_public, author_id)
        SELECT a.t, a.c, a.cat, a.pub, adm
        FROM (VALUES
          ('Term 3 examination timetable released', 'The Term 3 end of term examination timetable is now on the student and parent portals. Please check your papers and times.', 'academic', true),
          ('Term 3 fees are now due', 'Term 3 invoices have been issued. Please settle the balance at the bursar''s office, by EcoCash or by bank transfer, and quote your invoice number.', 'finance', true),
          ('Inter-house athletics day', 'Our annual inter-house athletics day takes place in week 3. Learners must wear their house colours. Parents are welcome to attend.', 'sports', true),
          ('Parents'' evening for Forms 3 and 4', 'Parents of Forms 3 and 4 are invited to discuss subject choices and progress with teachers. Book a slot with the class teacher.', 'academic', true),
          ('ZIMSEC O-Level registration open', 'Form 4 learners must complete their examination registration with the office before the end of the month.', 'academic', true),
          ('New computer laboratory opened', 'Computer Lab 2 is now open, with 30 new workstations and fast internet for all computer science classes.', 'general', true),
          ('Boarders: visiting day', 'The next boarders'' visiting day is the first Saturday of the month, from 10:00 to 16:00. Please bring identification.', 'boarding', true),
          ('Uniform shop opening hours', 'The uniform shop is open on Tuesdays and Thursdays from 14:30 to 16:30 at the bursar''s office.', 'general', true),
          ('Library reading challenge', 'Join the library reading challenge. Read five books this term and win a certificate at prize giving.', 'general', true),
          ('Prize giving date announced', 'Prize giving will be held on the first Friday of December. Award winners will be informed by their class teachers.', 'general', true)) AS a(t, c, cat, pub)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'announcements', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'events';
    BEGIN
      WITH ins AS (
        INSERT INTO public.events (title, description, event_date, event_type)
        SELECT e.t, e.d, (current_date + e.days)::date, e.ty
        FROM (VALUES
          ('Inter-house athletics', 'Track and field events for all houses.', 14, 'sports'),
          ('Parents'' evening', 'Meet the teachers and discuss progress.', 24, 'academic'),
          ('Science fair', 'Learners present experiments and projects.', 30, 'academic'),
          ('Term 3 examinations begin', 'End of term examinations start.', 28, 'academic'),
          ('Inter-school football final', 'Home match against Lakeside High.', 10, 'sports'),
          ('Careers day', 'Visitors from local industry talk to Forms 4 to 6.', 38, 'academic'),
          ('Prize giving', 'Annual awards ceremony in the School Hall.', 60, 'social'),
          ('School closes for Term 3', 'Last day of the term.', 62, 'academic')) AS e(t, d, days, ty)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'events', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'meetings';
    BEGIN
      WITH ins AS (
        INSERT INTO public.meetings (title, description, meeting_date, location, meeting_type)
        SELECT m.t, m.d, (current_date + m.days)::date + time '14:30', m.loc, m.ty
        FROM (VALUES
          ('Staff meeting: end of term planning', 'Examinations, reports and closing arrangements.', 3, 'Staffroom', 'staff'),
          ('Heads of department meeting', 'Results analysis and resource requests.', 6, 'Principal''s office', 'staff'),
          ('PTA general meeting', 'Fundraising for the science laboratory.', 17, 'School Hall', 'parents'),
          ('Boarding committee', 'Welfare and menu review.', 9, 'Boarding office', 'staff'),
          ('School development committee', 'Term 3 budget and projects.', 21, 'Boardroom', 'board')) AS m(t, d, days, loc, ty)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'meetings', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'awards';
    BEGIN
      WITH ins AS (
        INSERT INTO public.awards (title, description, category, recipient, year)
        SELECT a.t, a.d, a.c, a.r, (yr::int - a.back)
        FROM (VALUES
          ('Best O-Level results in the province', 'Highest pass rate among schools in Harare Province.', 'Academic', 'MavingTech High School', 1),
          ('Provincial football champions', 'Won the under-17 provincial championship.', 'Sports', 'Boys football team', 1),
          ('National science fair finalist', 'Reached the national final with a water purification project.', 'Academic', 'Form 4 Science group', 2),
          ('Debate cup winners', 'Inter-school debate cup.', 'Culture', 'Debating society', 1),
          ('Most improved school', 'Recognised by the Ministry for improved examination results.', 'Academic', 'MavingTech High School', 3),
          ('Choir festival gold', 'Gold award at the regional choir festival.', 'Culture', 'School choir', 2)) AS a(t, d, c, r, back)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'awards', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'projects';
    BEGIN
      WITH ins AS (
        INSERT INTO public.school_projects (name, description, goal_amount, raised_amount, is_active)
        SELECT p.n, p.d, p.g, p.r, true
        FROM (VALUES
          ('New science laboratory', 'A fourth science laboratory so every class can do practical work.', 25000, 14200),
          ('Solar power for the school', 'Solar panels to cut electricity costs and keep the computer labs running.', 18000, 6500),
          ('Library books drive', 'New textbooks and storybooks for the library.', 5000, 3800),
          ('Borehole for the sports field', 'A borehole to keep the sports field green through the dry season.', 9000, 2100)) AS p(n, d, g, r)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'school_projects', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'facilities';
    BEGIN
      WITH ins AS (
        INSERT INTO public.facilities (name, description, category, capacity, is_active)
        SELECT f.n, f.d, f.c, f.cap, true
        FROM (VALUES
          ('Science laboratories', 'Three equipped laboratories for physics, chemistry and biology.', 'academic', 108),
          ('Computer laboratories', 'Two laboratories with 58 workstations and internet.', 'academic', 58),
          ('School library', 'Over 6,000 books, study desks and quiet reading areas.', 'academic', 80),
          ('Sports field', 'Football, rugby and athletics track.', 'sports', 300),
          ('Netball and tennis courts', 'Four courts, floodlit for evening practice.', 'sports', 60),
          ('School hall', 'Assemblies, examinations and concerts.', 'general', 500),
          ('Boarding houses', 'Two houses for 100 boarders with matrons on duty.', 'boarding', 100),
          ('Tuck shop and dining hall', 'Meals for boarders and a tuck shop for all learners.', 'general', 250)) AS f(n, d, c, cap)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'facilities', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'sports fixtures';
    BEGIN
      WITH ins AS (
        INSERT INTO public.sports_schedule (sport, activity_name, activity_type, event_date, day_of_week, start_time, end_time, venue, opponent, result)
        SELECT s.sp, s.act, s.ty, (current_date + s.days)::date, extract(isodow FROM (current_date + s.days)::date)::int, s.st::time, s.et::time, s.venue, s.opp, s.res
        FROM (VALUES
          ('Football', 'First team v Lakeside High', 'match', 10, '15:00', '17:00', 'Home, main field', 'Lakeside High', NULL),
          ('Netball', 'Senior girls v St Dominic''s', 'match', 12, '14:30', '16:00', 'Home, netball courts', 'St Dominic''s', NULL),
          ('Athletics', 'Inter-house athletics', 'event', 14, '08:00', '16:00', 'Home, athletics track', NULL, NULL),
          ('Rugby', 'Under-16 v Prince Edward', 'match', 17, '15:00', '17:00', 'Away', 'Prince Edward', NULL),
          ('Football', 'First team v Gateway High', 'match', -7, '15:00', '17:00', 'Away', 'Gateway High', 'Won 2-1'),
          ('Netball', 'Senior girls v Harare Girls', 'match', -10, '14:30', '16:00', 'Home, netball courts', 'Harare Girls', 'Won 34-28'),
          ('Basketball', 'Boys v Westridge', 'match', -14, '15:00', '16:30', 'Away', 'Westridge', 'Lost 41-45'),
          ('Chess', 'Inter-school chess tournament', 'event', 20, '09:00', '13:00', 'School library', NULL, NULL),
          ('Cricket', 'Under-15 v Eaglesvale', 'match', 25, '14:00', '17:00', 'Home, main field', 'Eaglesvale', NULL),
          ('Swimming', 'Gala at the municipal pool', 'event', 31, '09:00', '14:00', 'Municipal pool', NULL, NULL)) AS s(sp, act, ty, days, st, et, venue, opp, res)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'sports_schedule', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'downloads';
    BEGIN
      WITH ins AS (
        INSERT INTO public.downloads (title, description, category, file_url)
        SELECT d.t, d.d, d.c, d.u
        FROM (VALUES
          ('School fees schedule 2026', 'Fees per term for day learners and boarders.', 'Fees', '/demo/documents/school-fees-schedule-2026.pdf'),
          ('Academic calendar 2026', 'Term dates, holidays and key events.', 'Calendar', '/demo/documents/academic-calendar-2026.pdf'),
          ('School rules and uniform policy', 'Conduct, attendance and uniform requirements.', 'Policies', '/demo/documents/school-rules-and-uniform.pdf'),
          ('Boarding information pack', 'Daily routine, what to bring and visiting arrangements.', 'Boarding', '/demo/documents/boarding-information-pack.pdf')) AS d(t, d, c, u)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'downloads', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'carousel';
    BEGIN
      WITH ins AS (
        INSERT INTO public.carousel_images (image_url, caption, display_order, is_active)
        SELECT c.u, c.cap, c.o, true
        FROM (VALUES
          ('/demo/images/carousel-1.jpg', 'Learning and friendship at MavingTech', 1),
          ('/demo/images/carousel-2.jpg', 'Active classrooms where every voice counts', 2),
          ('/demo/images/carousel-3.jpg', 'Sport builds teamwork and character', 3),
          ('/demo/images/carousel-4.jpg', 'Celebrating achievement', 4)) AS c(u, cap, o)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'carousel_images', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'gallery';
    BEGIN
      WITH ins AS (
        INSERT INTO public.gallery_images (image_url, caption, category, is_active)
        SELECT g.u, g.cap, g.cat, true
        FROM (VALUES
          ('/demo/images/gallery-sports.jpg', 'Inter-house sports day', 'Sports'),
          ('/demo/images/gallery-music.jpg', 'School choir rehearsal', 'Culture'),
          ('/demo/images/gallery-arts.jpg', 'Art class', 'Culture'),
          ('/demo/images/gallery-clubs.jpg', 'Clubs and societies', 'Clubs'),
          ('/demo/images/gallery-computers.jpg', 'Computer science lesson', 'Academics'),
          ('/demo/images/gallery-science.jpg', 'Science practical', 'Academics'),
          ('/demo/images/gallery-maths.jpg', 'Mathematics class', 'Academics'),
          ('/demo/images/gallery-literature.jpg', 'Literature and languages', 'Academics')) AS g(u, cap, cat)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'gallery_images', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'appointments';
    BEGIN
      WITH firsts AS (
        SELECT DISTINCT ON (ps.parent_id) ps.parent_id, ps.student_id, COALESCE(ct.user_id, adm) AS teacher_uid, dl.admission_number
        FROM public.parent_students ps
        JOIN dl ON dl.student_id = ps.student_id
        JOIN public.classes cl ON cl.id = dl.class_id
        LEFT JOIN public.staff ct ON ct.id = cl.class_teacher_id
        ORDER BY ps.parent_id, dl.admission_number),
      pick AS (SELECT f.*, row_number() OVER (ORDER BY f.admission_number, f.parent_id) AS n FROM firsts f ORDER BY f.admission_number, f.parent_id LIMIT 8),
      ins AS (
        INSERT INTO public.appointments (parent_id, student_id, teacher_id, appointment_date, status, notes)
        SELECT p.parent_id, p.student_id, p.teacher_uid, (current_date + 3 + (p.n::int))::date + time '15:00',
               CASE WHEN p.n % 3 = 0 THEN 'pending' ELSE 'confirmed' END, 'Discuss progress and homework'
        FROM pick p
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'appointments', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'sms templates';
    BEGIN
      WITH ins AS (
        INSERT INTO public.sms_templates (name, body, category, variables)
        SELECT t.nm, t.b, t.c, t.v
        FROM (VALUES
          ('Fees reminder', 'Dear {{parent_name}}, the {{term}} fees balance for {{student_name}} is US$ {{balance}}. Please pay at the bursar''s office. Thank you.', 'finance', ARRAY['parent_name', 'term', 'student_name', 'balance']),
          ('Absence notice', 'Dear {{parent_name}}, {{student_name}} was absent from school today. Please contact the class teacher.', 'attendance', ARRAY['parent_name', 'student_name']),
          ('Results available', 'Dear {{parent_name}}, the {{term}} results for {{student_name}} are now on the parent portal.', 'academic', ARRAY['parent_name', 'term', 'student_name']),
          ('Meeting invitation', 'Dear {{parent_name}}, you are invited to the parents'' evening on {{date}} at {{time}}.', 'events', ARRAY['parent_name', 'date', 'time']),
          ('School closure', 'Dear parents, the school will close early on {{date}}. Learners should be collected by {{time}}.', 'general', ARRAY['date', 'time'])) AS t(nm, b, c, v)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'sms_templates', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'messages sent';
    BEGIN
      WITH ins AS (
        INSERT INTO public.communication_logs (channel, subject, body, recipient_type, recipient_count, status, sent_at, user_id)
        SELECT c.ch, c.sj, c.b, c.rt, c.cnt, 'sent', now() - (c.days || ' days')::interval, adm
        FROM (VALUES
          ('sms', 'Fees reminder', 'Reminder: Term 3 fees are due.', 'parents', 214, 5),
          ('sms', 'Results available', 'Term 2 results are on the parent portal.', 'parents', 816, 40),
          ('email', 'Parents'' evening', 'You are invited to the parents'' evening.', 'parents', 816, 9),
          ('sms', 'Athletics day', 'Inter-house athletics next week. Wear house colours.', 'all', 1355, 12),
          ('email', 'Staff meeting', 'Staff meeting on Friday at 14:30.', 'staff', 30, 2),
          ('sms', 'School closure', 'The school closes early on Friday.', 'parents', 816, 20)) AS c(ch, sj, b, rt, cnt, days)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'communication_logs', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'teacher-parent contact log';
    BEGIN
      WITH firsts AS (
        SELECT DISTINCT ON (ps.parent_id) ps.parent_id, ps.student_id, COALESCE(ct.user_id, adm) AS teacher_uid, dl.admission_number
        FROM public.parent_students ps
        JOIN dl ON dl.student_id = ps.student_id
        JOIN public.classes cl ON cl.id = dl.class_id
        LEFT JOIN public.staff ct ON ct.id = cl.class_teacher_id
        ORDER BY ps.parent_id, dl.admission_number),
      pick AS (SELECT f.*, row_number() OVER (ORDER BY f.admission_number, f.parent_id) AS n FROM firsts f ORDER BY f.admission_number, f.parent_id LIMIT 12),
      ins AS (
        INSERT INTO public.parent_communication_logs (teacher_id, parent_id, student_id, channel, subject, message, follow_up_date, follow_up_completed)
        SELECT p.teacher_uid, p.parent_id, p.student_id, (ARRAY['phone', 'sms', 'meeting'])[1 + (p.n % 3)::int],
               (ARRAY['Progress update', 'Attendance concern', 'Homework not handed in', 'Positive feedback'])[1 + (p.n % 4)::int],
               'Spoke with the parent about the learner''s recent progress and agreed next steps.',
               CASE WHEN p.n % 2 = 0 THEN (current_date + 7)::date END, false
        FROM pick p
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'parent_communication_logs', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'website enquiries';
    BEGIN
      WITH ins AS (
        INSERT INTO public.contact_messages (name, email, subject, message)
        SELECT q.nm, q.em, q.sj, q.msg
        FROM (VALUES
          ('Mrs. Rutendo Chigumba', 'rutendo.c@example.com', 'Form 1 admission', 'Are there places for Form 1 next year, and what documents do I need?'),
          ('Mr. Tafara Mlambo', 'tafara.m@example.com', 'Boarding fees', 'Could you send the boarding fee structure for a Form 3 boy?'),
          ('Ms. Nokuthula Sibanda', 'nokuthula.s@example.com', 'Transfer from Bulawayo', 'My daughter is moving to Harare. Can she join Form 4 mid-year?'),
          ('Mr. Kudakwashe Dube', 'kuda.d@example.com', 'Visiting the school', 'May we visit the school on Saturday to see the facilities?'),
          ('Mrs. Memory Nyathi', 'memory.n@example.com', 'Scholarships', 'Do you offer scholarships for high-achieving learners?'),
          ('Mr. Blessing Hove', 'blessing.h@example.com', 'A-Level subjects', 'Which A-Level subject combinations are offered?')) AS q(nm, em, sj, msg)
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'contact_messages', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'staff leave';
    BEGIN
      WITH t AS (SELECT q.id, q.n FROM (SELECT s.id, row_number() OVER (ORDER BY s.full_name) AS n FROM public.staff s
                                          WHERE s.role = 'teacher' AND s.email LIKE '%schooldemo.com') q WHERE q.n <= 8),
      ins AS (
        INSERT INTO public.leave_requests (staff_id, leave_type, start_date, end_date, reason, status, reviewed_at, reviewed_by)
        SELECT t.id, (ARRAY['annual', 'sick', 'study', 'compassionate'])[1 + (t.n % 4)::int], (current_date + ((t.n * 3)::int))::date, (current_date + ((t.n * 3 + 2)::int))::date,
               (ARRAY['Family visit', 'Medical appointment', 'Study leave for exams', 'Funeral'])[1 + (t.n % 4)::int],
               CASE WHEN t.n <= 3 THEN 'pending' WHEN t.n <= 6 THEN 'approved' ELSE 'rejected' END,
               CASE WHEN t.n > 3 THEN now() - interval '1 day' END, CASE WHEN t.n > 3 THEN adm END
        FROM t
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'leave_requests', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;

    step := 'notifications';
    BEGIN
      WITH who AS (
        SELECT st.user_id AS uid, 'student' AS kind FROM public.students st WHERE lower(st.email) LIKE '%schooldemo.com' AND st.user_id IS NOT NULL
        UNION ALL
        SELECT DISTINCT ps.parent_id, 'parent' FROM public.parent_students ps JOIN dl ON dl.student_id = ps.student_id),
      ins AS (
        INSERT INTO public.notifications (user_id, title, message, type, link, is_read)
        SELECT w.uid, m.t, m.b, 'info', CASE WHEN w.kind = 'student' THEN '/portal/student' ELSE '/portal/parent' END, false
        FROM who w CROSS JOIN (VALUES
          ('Term 3 timetable is live', 'Your weekly timetable for Term 3 is available on your dashboard.'),
          ('Term 3 examinations', 'The examination timetable has been released. Check your papers and times.')) AS m(t, b)
        WHERE (('x' || substr(md5(w.uid::text), 1, 6))::bit(24)::int % 5) = 0
        RETURNING id)
      INSERT INTO public.demo_seed_rows (table_name, row_id) SELECT 'notifications', id FROM ins;
      GET DIAGNOSTICS n = ROW_COUNT; loaded := loaded || jsonb_build_object(step, n);
    EXCEPTION WHEN OTHERS THEN failed := failed || jsonb_build_object('step', step, 'error', SQLERRM);
    END;
  END IF;

  RETURN jsonb_build_object('area', _area, 'loaded', loaded, 'failed', failed);
END $$;
REVOKE ALL ON FUNCTION public.seed_demo_school_life(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seed_demo_school_life(text) TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
