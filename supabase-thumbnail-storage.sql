-- =============================================
-- Supabase Storage Bucket and Policies for Live Stream Thumbnails
-- =============================================
-- Run this in Supabase SQL Editor after setting up the main schema
--
-- This creates:
-- 1. A 'thumbnails' folder in the 'stream-recordings' bucket
-- 2. Policies to allow authenticated users to upload thumbnails
-- 3. Public read access for everyone to view thumbnails

-- Note: We're using the existing 'stream-recordings' bucket
-- Thumbnails are stored in: stream-recordings/thumbnails/

-- =============================================
-- STORAGE POLICIES FOR THUMBNAILS
-- =============================================

-- Policy 1: Allow authenticated users to upload thumbnails
-- (Used when auto-capturing live stream previews)
DROP POLICY IF EXISTS "Authenticated users can upload thumbnails" ON storage.objects;
CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'stream-recordings' AND
  (storage.foldername(name))[1] = 'thumbnails'
);

-- Policy 2: Allow users to update their own thumbnails
-- (In case we need to replace an old thumbnail)
DROP POLICY IF EXISTS "Users can update their own thumbnails" ON storage.objects;
CREATE POLICY "Users can update their own thumbnails"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'stream-recordings' AND
  (storage.foldername(name))[1] = 'thumbnails'
)
WITH CHECK (
  bucket_id = 'stream-recordings' AND
  (storage.foldername(name))[1] = 'thumbnails'
);

-- Policy 3: Allow users to delete their own thumbnails
-- (For cleanup purposes)
DROP POLICY IF EXISTS "Users can delete their own thumbnails" ON storage.objects;
CREATE POLICY "Users can delete their own thumbnails"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'stream-recordings' AND
  (storage.foldername(name))[1] = 'thumbnails'
);

-- Policy 4: Allow public read access to all thumbnails
-- (So anyone can see the animated preview clips on stream cards)
DROP POLICY IF EXISTS "Public can view thumbnails" ON storage.objects;
CREATE POLICY "Public can view thumbnails"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'stream-recordings' AND
  (storage.foldername(name))[1] = 'thumbnails'
);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify policies are set up correctly

-- 1. Check all policies for stream-recordings bucket
SELECT 
  policyname, 
  cmd, 
  roles, 
  qual, 
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

-- 2. Check bucket configuration
SELECT * FROM storage.buckets WHERE id = 'stream-recordings';

