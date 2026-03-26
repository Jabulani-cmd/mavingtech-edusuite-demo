-- Allow HODs and Deputy Principals to read leave requests
CREATE POLICY "HOD read leave_requests" ON public.leave_requests
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'hod'::app_role));

CREATE POLICY "Deputy principal read leave_requests" ON public.leave_requests
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'deputy_principal'::app_role));

-- Allow teachers to read all leave requests (so they see colleagues)
CREATE POLICY "Teachers read leave_requests" ON public.leave_requests
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role));