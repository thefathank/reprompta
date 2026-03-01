
-- Make media-uploads bucket private
UPDATE storage.buckets SET public = false WHERE id = 'media-uploads';

-- Drop the permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view media" ON storage.objects;

-- Add policy for authenticated users to view their own files (path starts with user_id)
CREATE POLICY "Users can view own media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
