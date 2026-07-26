
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='school_media_receipts_insert') THEN
    CREATE POLICY school_media_receipts_insert ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'school-media' AND (storage.foldername(name))[1] = 'receipts');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='school_media_receipts_update') THEN
    CREATE POLICY school_media_receipts_update ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'school-media' AND (storage.foldername(name))[1] = 'receipts')
      WITH CHECK (bucket_id = 'school-media' AND (storage.foldername(name))[1] = 'receipts');
  END IF;
END $$;
