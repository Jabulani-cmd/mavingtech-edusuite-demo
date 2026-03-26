-- Allow students to view their own record
CREATE POLICY "Students can view own record"
ON public.students
FOR SELECT
TO authenticated
USING (user_id = auth.uid());