-- ========================================
-- ADD "RECENTLY LIVE" FEATURE
-- Keep streams in "Live Now" for 30 min after ending
-- ========================================

-- Add new field to track recently live streams
ALTER TABLE public.streams 
ADD COLUMN IF NOT EXISTS recently_live_until TIMESTAMP WITH TIME ZONE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_streams_recently_live ON public.streams(recently_live_until);

-- Success message
SELECT '✅ Recently Live feature enabled!' as message;
SELECT 'Streams will now stay in "Live Now" for 30 minutes after ending' as info;

