INSERT INTO storage.buckets (id, name, public)
VALUES ('school-media', 'school-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read school-media'
  ) THEN
    CREATE POLICY "Public read school-media"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'school-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated upload school-media'
  ) THEN
    CREATE POLICY "Authenticated upload school-media"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'school-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated update school-media'
  ) THEN
    CREATE POLICY "Authenticated update school-media"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'school-media')
    WITH CHECK (bucket_id = 'school-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated delete school-media'
  ) THEN
    CREATE POLICY "Authenticated delete school-media"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'school-media');
  END IF;
END $$;