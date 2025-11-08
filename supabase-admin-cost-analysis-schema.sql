-- ============================================================================
-- ADMIN PLATFORM COST ANALYSIS - DATABASE SCHEMA
-- ============================================================================
-- Purpose: Add support for thumbnail mode settings and resource monitoring
-- Created: November 8, 2025
-- Demo: November 10, 2025
--
-- This schema adds:
-- 1. New columns to streams table for video clips
-- 2. app_settings table for global configuration
-- 3. resource_snapshots table for usage tracking
-- ============================================================================

-- ============================================================================
-- STEP 1: Update streams table to support multiple video formats
-- ============================================================================

-- Add source_type column to distinguish YouTube from live events
ALTER TABLE streams 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'live_event'
CHECK (source_type IN ('youtube', 'live_event'));

-- Add YouTube-specific fields
ALTER TABLE streams 
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_thumbnail_url TEXT;

-- Add live event video clip fields
ALTER TABLE streams 
ADD COLUMN IF NOT EXISTS video_30s_url TEXT,
ADD COLUMN IF NOT EXISTS video_30s_size_kb INTEGER,
ADD COLUMN IF NOT EXISTS video_12s_url TEXT,
ADD COLUMN IF NOT EXISTS video_12s_size_kb INTEGER,
ADD COLUMN IF NOT EXISTS thumbnail_frozen_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_frozen_size_kb INTEGER,
ADD COLUMN IF NOT EXISTS full_video_url TEXT,
ADD COLUMN IF NOT EXISTS full_video_size_mb NUMERIC(10, 2);

-- Add timestamp for when clips were captured
ALTER TABLE streams 
ADD COLUMN IF NOT EXISTS clips_captured_at TIMESTAMPTZ;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_streams_source_type ON streams(source_type);
CREATE INDEX IF NOT EXISTS idx_streams_is_live_true ON streams(is_live) WHERE is_live = true;

-- Update existing YouTube streams to have correct source_type
UPDATE streams 
SET source_type = 'youtube' 
WHERE youtube_url IS NOT NULL OR playback_url LIKE '%youtube%' OR playback_url LIKE '%youtu.be%';

COMMENT ON COLUMN streams.source_type IS 'Indicates whether stream is from YouTube import or live event recording';
COMMENT ON COLUMN streams.video_30s_url IS 'URL to 30-second preview clip (captured at 20s mark)';
COMMENT ON COLUMN streams.video_12s_url IS 'URL to 12-second preview clip (captured at 20s mark)';
COMMENT ON COLUMN streams.thumbnail_frozen_url IS 'URL to static thumbnail image (captured at 20s mark)';
COMMENT ON COLUMN streams.full_video_url IS 'URL to complete recording of live stream';
COMMENT ON COLUMN streams.clips_captured_at IS 'Timestamp when preview clips were captured during live stream';

-- ============================================================================
-- STEP 2: Create app_settings table for global configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Ensure only valid settings can be stored
  CONSTRAINT valid_setting_key CHECK (setting_key IN ('thumbnail_mode'))
);

-- Create index for fast lookup by setting key
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);

-- Insert default thumbnail mode setting
INSERT INTO app_settings (setting_key, setting_value) 
VALUES ('thumbnail_mode', 'hover')
ON CONFLICT (setting_key) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE app_settings IS 'Global application settings that affect all users';
COMMENT ON COLUMN app_settings.setting_key IS 'Unique identifier for the setting (e.g., thumbnail_mode)';
COMMENT ON COLUMN app_settings.setting_value IS 'Current value of the setting (e.g., frozen, hover, 12s, 30s)';
COMMENT ON COLUMN app_settings.updated_by_user_id IS 'Admin user who last updated this setting';

-- ============================================================================
-- STEP 3: Create resource_snapshots table for usage tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS resource_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_time TIMESTAMPTZ DEFAULT NOW(),
  
  -- Stream counts
  total_streams INTEGER DEFAULT 0,
  youtube_streams INTEGER DEFAULT 0,
  live_event_streams INTEGER DEFAULT 0,
  currently_live_streams INTEGER DEFAULT 0,
  
  -- Storage usage (in MB)
  youtube_thumbnails_mb NUMERIC(10, 2) DEFAULT 0,
  live_30s_clips_mb NUMERIC(10, 2) DEFAULT 0,
  live_12s_clips_mb NUMERIC(10, 2) DEFAULT 0,
  live_frozen_thumbs_mb NUMERIC(10, 2) DEFAULT 0,
  live_full_recordings_gb NUMERIC(10, 2) DEFAULT 0,
  total_storage_mb NUMERIC(10, 2) DEFAULT 0,
  
  -- Bandwidth estimates (in GB)
  bandwidth_today_gb NUMERIC(10, 2) DEFAULT 0,
  bandwidth_month_gb NUMERIC(10, 2) DEFAULT 0,
  
  -- Cost estimate
  estimated_monthly_cost NUMERIC(10, 2) DEFAULT 0,
  
  -- Current thumbnail mode at time of snapshot
  thumbnail_mode_active TEXT
);

-- Create index for time-series queries (most recent first)
CREATE INDEX IF NOT EXISTS idx_resource_snapshots_time ON resource_snapshots(snapshot_time DESC);

-- Add comments for documentation
COMMENT ON TABLE resource_snapshots IS 'Periodic snapshots of resource usage for analytics and monitoring';
COMMENT ON COLUMN resource_snapshots.snapshot_time IS 'When this snapshot was taken';
COMMENT ON COLUMN resource_snapshots.total_streams IS 'Total number of streams in database';
COMMENT ON COLUMN resource_snapshots.youtube_streams IS 'Number of YouTube imported streams';
COMMENT ON COLUMN resource_snapshots.live_event_streams IS 'Number of live event recordings';
COMMENT ON COLUMN resource_snapshots.currently_live_streams IS 'Number of streams currently live at snapshot time';
COMMENT ON COLUMN resource_snapshots.estimated_monthly_cost IS 'Predicted monthly cost in USD based on current usage';

-- ============================================================================
-- STEP 4: Create helper functions for resource calculations
-- ============================================================================

-- Function to calculate current resource usage
CREATE OR REPLACE FUNCTION calculate_resource_usage()
RETURNS TABLE (
  total_streams BIGINT,
  youtube_streams BIGINT,
  live_event_streams BIGINT,
  currently_live_streams BIGINT,
  total_30s_clips BIGINT,
  total_12s_clips BIGINT,
  total_frozen_thumbs BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_streams,
    COUNT(*) FILTER (WHERE source_type = 'youtube') as youtube_streams,
    COUNT(*) FILTER (WHERE source_type = 'live_event') as live_event_streams,
    COUNT(*) FILTER (WHERE is_live = true) as currently_live_streams,
    COUNT(*) FILTER (WHERE video_30s_url IS NOT NULL) as total_30s_clips,
    COUNT(*) FILTER (WHERE video_12s_url IS NOT NULL) as total_12s_clips,
    COUNT(*) FILTER (WHERE thumbnail_frozen_url IS NOT NULL) as total_frozen_thumbs
  FROM streams;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_resource_usage IS 'Calculates current stream counts and resource availability';

-- Function to get current thumbnail mode
CREATE OR REPLACE FUNCTION get_thumbnail_mode()
RETURNS TEXT AS $$
DECLARE
  current_mode TEXT;
BEGIN
  SELECT setting_value INTO current_mode
  FROM app_settings
  WHERE setting_key = 'thumbnail_mode';
  
  -- Default to 'hover' if not set
  RETURN COALESCE(current_mode, 'hover');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_thumbnail_mode IS 'Returns the current thumbnail display mode setting';

-- ============================================================================
-- STEP 5: Enable Row Level Security (RLS) policies
-- ============================================================================

-- app_settings: Allow all users to read, only admins to write
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read app settings (needed for thumbnail mode)
CREATE POLICY "Public read access for app settings"
ON app_settings FOR SELECT
USING (true);

-- Only authenticated users can update (will add admin check in API)
CREATE POLICY "Authenticated update for app settings"
ON app_settings FOR UPDATE
USING (auth.role() = 'authenticated');

-- resource_snapshots: Read-only for authenticated users
ALTER TABLE resource_snapshots ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read snapshots (for admin dashboard)
CREATE POLICY "Authenticated read access for resource snapshots"
ON resource_snapshots FOR SELECT
USING (auth.role() = 'authenticated');

-- Only service role can insert snapshots (from cron jobs)
CREATE POLICY "Service role insert for resource snapshots"
ON resource_snapshots FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- STEP 6: Create storage buckets for video clips
-- ============================================================================

-- NOTE: These need to be created in Supabase Dashboard or via API
-- Bucket: 'live-events' with folders:
--   - previews-30s/
--   - previews-12s/
--   - thumbnails-frozen/
--   - full-recordings/

-- Bucket policies should allow:
-- - Public read access (for displaying videos)
-- - Authenticated upload (service role for API uploads)

-- ============================================================================
-- STEP 7: Sample data for testing (optional)
-- ============================================================================

-- Uncomment to insert test resource snapshot
/*
INSERT INTO resource_snapshots (
  total_streams,
  youtube_streams,
  live_event_streams,
  currently_live_streams,
  youtube_thumbnails_mb,
  live_30s_clips_mb,
  live_12s_clips_mb,
  live_frozen_thumbs_mb,
  live_full_recordings_gb,
  total_storage_mb,
  bandwidth_today_gb,
  bandwidth_month_gb,
  estimated_monthly_cost,
  thumbnail_mode_active
) VALUES (
  100,    -- total_streams
  70,     -- youtube_streams  
  30,     -- live_event_streams
  3,      -- currently_live_streams
  7.0,    -- youtube_thumbnails_mb
  105.0,  -- live_30s_clips_mb
  45.0,   -- live_12s_clips_mb
  3.0,    -- live_frozen_thumbs_mb
  2.1,    -- live_full_recordings_gb
  160.0,  -- total_storage_mb
  18.0,   -- bandwidth_today_gb
  540.0,  -- bandwidth_month_gb
  1.44,   -- estimated_monthly_cost
  '30s'   -- thumbnail_mode_active
);
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if new columns were added to streams
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'streams' 
  AND column_name IN (
    'source_type', 'youtube_url', 'video_30s_url', 'video_12s_url', 
    'thumbnail_frozen_url', 'full_video_url', 'clips_captured_at'
  )
ORDER BY column_name;

-- Check if app_settings table exists
SELECT * FROM app_settings;

-- Check if resource_snapshots table exists
SELECT COUNT(*) as snapshot_count FROM resource_snapshots;

-- Test resource calculation function
SELECT * FROM calculate_resource_usage();

-- Test get thumbnail mode function
SELECT get_thumbnail_mode();

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================

/*
-- To rollback all changes, run:

DROP FUNCTION IF EXISTS calculate_resource_usage();
DROP FUNCTION IF EXISTS get_thumbnail_mode();
DROP TABLE IF EXISTS resource_snapshots;
DROP TABLE IF EXISTS app_settings;
ALTER TABLE streams DROP COLUMN IF EXISTS source_type;
ALTER TABLE streams DROP COLUMN IF EXISTS youtube_url;
ALTER TABLE streams DROP COLUMN IF EXISTS youtube_thumbnail_url;
ALTER TABLE streams DROP COLUMN IF EXISTS video_30s_url;
ALTER TABLE streams DROP COLUMN IF EXISTS video_30s_size_kb;
ALTER TABLE streams DROP COLUMN IF EXISTS video_12s_url;
ALTER TABLE streams DROP COLUMN IF EXISTS video_12s_size_kb;
ALTER TABLE streams DROP COLUMN IF EXISTS thumbnail_frozen_url;
ALTER TABLE streams DROP COLUMN IF EXISTS thumbnail_frozen_size_kb;
ALTER TABLE streams DROP COLUMN IF EXISTS full_video_url;
ALTER TABLE streams DROP COLUMN IF EXISTS full_video_size_mb;
ALTER TABLE streams DROP COLUMN IF EXISTS clips_captured_at;
DROP INDEX IF EXISTS idx_streams_source_type;
DROP INDEX IF EXISTS idx_streams_is_live_true;
*/

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Next steps after running this schema:
-- 1. Create storage buckets in Supabase Dashboard
-- 2. Set up bucket policies for public read access
-- 3. Test uploading files to each bucket
-- 4. Implement API endpoints (see ADMIN_PLATFORM_COST_ANALYSIS.md)
-- 5. Build UI components

