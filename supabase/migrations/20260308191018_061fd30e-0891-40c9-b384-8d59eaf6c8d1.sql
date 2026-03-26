
DROP POLICY IF EXISTS "Admins manage fee_structures" ON public.fee_structures;
CREATE POLICY "Admins manage fee_structures" ON public.fee_structures
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
