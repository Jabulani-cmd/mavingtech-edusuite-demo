DROP POLICY IF EXISTS "Parents can view linked students" ON public.students;

CREATE POLICY "Parents can view linked students"
ON public.students
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.parent_students ps
    WHERE ps.student_id = students.id
      AND ps.parent_id = auth.uid()
  )
);