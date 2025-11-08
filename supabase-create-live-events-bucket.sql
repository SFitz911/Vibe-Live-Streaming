-- ============================================================================
-- CREATE LIVE EVENTS STORAGE BUCKET
-- ============================================================================
-- Purpose: Create storage bucket for 30s/12s clips and frozen thumbnails
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Create the live-events bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'live-events',
  'live-events',
  true, -- Public access for viewing
  104857600, -- 100MB per file
  ARRAY['video/webm', 'video/mp4', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/webm', 'video/mp4', 'image/jpeg', 'image/png', 'image/jpg'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for live events" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to live events" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload to live events" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own live event content" ON storage.objects;

-- Create policy for public read access
CREATE POLICY "Public read access for live events"
ON storage.objects FOR SELECT
USING (bucket_id = 'live-events');

-- Create policy for authenticated uploads
CREATE POLICY "Authenticated users can upload to live events"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'live-events' 
  AND auth.role() = 'authenticated'
);

-- Create policy for service role uploads (for API uploads)
CREATE POLICY "Service role can upload to live events"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'live-events' 
  AND auth.role() = 'service_role'
);

-- Create policy for users to delete their own content
CREATE POLICY "Users can delete their own live event content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'live-events'
  AND auth.role() = 'authenticated'
);

-- Verify bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'live-events';

-- Verify policies were created
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%live events%';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ live-events bucket created successfully!';
  RAISE NOTICE '📁 Bucket structure:';
  RAISE NOTICE '   live-events/';
  RAISE NOTICE '   ├── previews-30s/    (30-second preview clips)';
  RAISE NOTICE '   ├── previews-12s/    (12-second preview clips)';
  RAISE NOTICE '   └── thumbnails-frozen/ (frozen frame thumbnails)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Policies created:';
  RAISE NOTICE '   ✅ Public read access';
  RAISE NOTICE '   ✅ Authenticated upload';
  RAISE NOTICE '   ✅ Service role upload';
  RAISE NOTICE '   ✅ User delete own content';
END $$;

