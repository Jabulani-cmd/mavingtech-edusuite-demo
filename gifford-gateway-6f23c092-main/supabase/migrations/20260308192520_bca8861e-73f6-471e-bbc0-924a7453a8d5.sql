
-- Drop all existing policies on fee_structures
DROP POLICY IF EXISTS "Admins manage fee_structures" ON public.fee_structures;
DROP POLICY IF EXISTS "Authenticated read fee_structures" ON public.fee_structures;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Admins manage fee_structures" ON public.fee_structures
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated read fee_structures" ON public.fee_structures
FOR SELECT TO authenticated
USING (true);
