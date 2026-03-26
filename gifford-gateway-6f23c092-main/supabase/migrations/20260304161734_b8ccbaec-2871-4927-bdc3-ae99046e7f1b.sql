
-- Drop the restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Admins manage site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can read site_settings" ON public.site_settings;

CREATE POLICY "Admins manage site_settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read site_settings"
ON public.site_settings
FOR SELECT
TO public
USING (true);
