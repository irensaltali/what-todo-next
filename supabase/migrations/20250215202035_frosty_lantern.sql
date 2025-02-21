/*
  # Create avatar storage bucket and policies

  1. Storage Setup
    - Create 'avatar' storage bucket
    - Enable public access for avatar images
  
  2. Security
    - Add policy for authenticated users to upload avatars
    - Add policy for public read access to avatars
*/

-- Create the avatar storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar', 'avatar', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload avatar files
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatar' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow authenticated users to update their own avatar files
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatar' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatar' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow authenticated users to delete their own avatar files
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatar' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow public read access to avatar files
CREATE POLICY "Public read access for avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatar');