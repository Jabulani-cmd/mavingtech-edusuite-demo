-- ============================================
-- PARENTS AND STUDENTS SEE ONLY THEIR OWN MARKS AND PAYMENTS
-- Two older read rules were never removed, so every signed-in user could read other families' records:
-- * "Authenticated can view payments" (USING true): any signed-in user could read every payment,
--   including payer phone numbers and receipts.
-- * "Parents read child marks": despite the name, it let any parent read every learner's marks.
-- The scoped rules remain: finance staff and school leaders read all payments, parents read their
-- children's (payments "Parents view child payments"), students their own ("Students view own payments");
-- marks use marks_read_scoped (staff, the learner and their parents).
-- Idempotent: safe to run more than once.
-- ============================================

DROP POLICY IF EXISTS "Authenticated can view payments" ON public.payments;
DROP POLICY IF EXISTS "Parents read child marks" ON public.marks;