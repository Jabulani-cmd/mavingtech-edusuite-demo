INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read profile-photos') THEN
    CREATE POLICY "Public read profile-photos" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated upload profile-photos') THEN
    CREATE POLICY "Authenticated upload profile-photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated update profile-photos') THEN
    CREATE POLICY "Authenticated update profile-photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated delete profile-photos') THEN
    CREATE POLICY "Authenticated delete profile-photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-photos');
  END IF;
END$$;