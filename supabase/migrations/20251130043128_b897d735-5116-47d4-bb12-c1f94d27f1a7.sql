-- Allow users to view their own selfie photos in the private selfie-photos bucket
CREATE POLICY "Users can view their own selfie"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'selfie-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);