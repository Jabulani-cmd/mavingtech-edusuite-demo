
-- Allow parents to view their linked children's student records
CREATE POLICY "Parents view linked students"
  ON public.students
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT ps.student_id FROM parent_students ps WHERE ps.parent_id = auth.uid()
    )
  );

-- Allow parents to view attendance for their linked children
CREATE POLICY "Parents view child attendance"
  ON public.attendance
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT ps.student_id FROM parent_students ps WHERE ps.parent_id = auth.uid()
    )
  );

-- Allow parents to view invoices for their linked children
CREATE POLICY "Parents view child invoices"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT ps.student_id FROM parent_students ps WHERE ps.parent_id = auth.uid()
    )
  );

-- Allow parents to view exam results for their linked children
CREATE POLICY "Parents view child exam_results"
  ON public.exam_results
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT ps.student_id FROM parent_students ps WHERE ps.parent_id = auth.uid()
    )
  );

-- Allow parents to view payments for their linked children
CREATE POLICY "Parents view child payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT ps.student_id FROM parent_students ps WHERE ps.parent_id = auth.uid()
    )
  );
