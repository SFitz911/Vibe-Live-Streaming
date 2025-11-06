-- ========================================
-- FULL STREAM RECORDING STORAGE
-- For Supabase Pro - 100GB Storage
-- ========================================

-- Create storage bucket for full stream recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stream-recordings',
  'stream-recordings',
  true,
  2147483648, -- 2GB per file limit
  ARRAY['video/webm', 'video/mp4', 'video/x-matroska']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read access for recordings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own recordings" ON storage.objects;

-- Create policies for recordings
CREATE POLICY "Public read access for recordings"
ON storage.objects FOR SELECT
USING (bucket_id = 'stream-recordings');

CREATE POLICY "Authenticated users can upload recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stream-recordings' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own recordings"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'stream-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'stream-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Success message
SELECT '✅ Full recording storage bucket created!' as status;
SELECT '📦 100GB Pro storage ready for stream recordings' as info;
SELECT '🎬 Users can now record and store full streams' as feature;

