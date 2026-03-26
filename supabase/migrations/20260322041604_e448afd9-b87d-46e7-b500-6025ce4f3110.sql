-- Allow teachers and management staff to upload/update/delete their own academic files in school-media
DROP POLICY IF EXISTS "Teachers and management upload academic media" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and management update academic media" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and management delete academic media" ON storage.objects;

CREATE POLICY "Teachers and management upload academic media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-media'
  AND (
    (
      split_part(name, '/', 1) IN ('materials', 'assessments', 'announcements')
      AND split_part(name, '/', 2) = auth.uid()::text
      AND (
        public.has_role(auth.uid(), 'teacher')
        OR public.has_role(auth.uid(), 'hod')
        OR public.has_role(auth.uid(), 'deputy_principal')
        OR public.has_role(auth.uid(), 'principal')
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'admin_supervisor')
      )
    )
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'admin_supervisor')
  )
);

CREATE POLICY "Teachers and management update academic media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'school-media'
  AND (
    (
      split_part(name, '/', 1) IN ('materials', 'assessments', 'announcements')
      AND split_part(name, '/', 2) = auth.uid()::text
      AND (
        public.has_role(auth.uid(), 'teacher')
        OR public.has_role(auth.uid(), 'hod')
        OR public.has_role(auth.uid(), 'deputy_principal')
        OR public.has_role(auth.uid(), 'principal')
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'admin_supervisor')
      )
    )
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'admin_supervisor')
  )
)
WITH CHECK (
  bucket_id = 'school-media'
  AND (
    (
      split_part(name, '/', 1) IN ('materials', 'assessments', 'announcements')
      AND split_part(name, '/', 2) = auth.uid()::text
      AND (
        public.has_role(auth.uid(), 'teacher')
        OR public.has_role(auth.uid(), 'hod')
        OR public.has_role(auth.uid(), 'deputy_principal')
        OR public.has_role(auth.uid(), 'principal')
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'admin_supervisor')
      )
    )
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'admin_supervisor')
  )
);

CREATE POLICY "Teachers and management delete academic media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-media'
  AND (
    (
      split_part(name, '/', 1) IN ('materials', 'assessments', 'announcements')
      AND split_part(name, '/', 2) = auth.uid()::text
      AND (
        public.has_role(auth.uid(), 'teacher')
        OR public.has_role(auth.uid(), 'hod')
        OR public.has_role(auth.uid(), 'deputy_principal')
        OR public.has_role(auth.uid(), 'principal')
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'admin_supervisor')
      )
    )
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'admin_supervisor')
  )
);