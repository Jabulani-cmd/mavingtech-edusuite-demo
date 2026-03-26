
-- Drop restrictive policies on parent_students and recreate as permissive
DROP POLICY IF EXISTS "Users can view own parent links" ON public.parent_students;
DROP POLICY IF EXISTS "System can insert parent_students" ON public.parent_students;
DROP POLICY IF EXISTS "Admin can delete parent_students" ON public.parent_students;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Users can view own parent links"
  ON public.parent_students FOR SELECT
  TO authenticated
  USING ((auth.uid() = parent_id) OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'admin_supervisor'::app_role, 'principal'::app_role]));

CREATE POLICY "System can insert parent_students"
  ON public.parent_students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can delete parent_students"
  ON public.parent_students FOR DELETE
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'admin_supervisor'::app_role, 'principal'::app_role]));
