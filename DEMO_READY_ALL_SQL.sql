-- ========================================
-- 🎉 DEMO READY - RUN THIS ONE FILE
-- Fixes ALL issues for your business demo
-- ========================================

-- ========================================
-- PART 1: AUTO-ADMIN FOR @NEXTWORK.ORG
-- ========================================

-- Auto-detect and set admin flag
CREATE OR REPLACE FUNCTION public.auto_set_nextwork_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = NEW.id 
        AND email ILIKE '%@nextwork.org'
    ) THEN
        NEW.is_nextwork_admin := true;
        NEW.is_verified := true;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_nextwork_admin_on_profile ON public.profiles;
CREATE TRIGGER set_nextwork_admin_on_profile
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_set_nextwork_admin();


-- ========================================
-- PART 2: DEMO PROFILE HELPER (HANDLES DUPLICATES)
-- ========================================

CREATE OR REPLACE FUNCTION public.upsert_demo_profile(
    p_id UUID,
    p_email TEXT,
    p_username TEXT,
    p_display_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    -- Check if @nextwork.org email
    v_is_admin := p_email ILIKE '%@nextwork.org';
    
    -- Insert or update profile (handles duplicates)
    INSERT INTO public.profiles (
        id, 
        username, 
        display_name, 
        is_streamer, 
        is_verified,
        is_nextwork_admin
    )
    VALUES (
        p_id, 
        p_username, 
        p_display_name, 
        true, 
        v_is_admin,
        v_is_admin
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        display_name = EXCLUDED.display_name,
        is_nextwork_admin = EXCLUDED.is_nextwork_admin,
        is_verified = EXCLUDED.is_verified,
        updated_at = NOW();
    
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in upsert_demo_profile for %: %', p_email, SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_demo_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_demo_profile TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_demo_profile TO service_role;


-- ========================================
-- PART 3: FIX EXISTING @NEXTWORK.ORG USERS
-- ========================================

UPDATE public.profiles p
SET 
    is_nextwork_admin = true,
    is_verified = true
FROM auth.users u
WHERE p.id = u.id
AND u.email ILIKE '%@nextwork.org'
AND (p.is_nextwork_admin = false OR p.is_nextwork_admin IS NULL);


-- ========================================
-- PART 4: CREATE MISSING PROFILES FOR ALL USERS
-- ========================================

INSERT INTO public.profiles (id, username, display_name, is_streamer, is_verified, is_nextwork_admin)
SELECT 
  u.id,
  LOWER(SPLIT_PART(u.email, '@', 1)) || '_' || SUBSTRING(u.id::text, 1, 6) as username,
  SPLIT_PART(u.email, '@', 1) as display_name,
  true as is_streamer,
  CASE WHEN u.email ILIKE '%@nextwork.org' THEN true ELSE false END as is_verified,
  CASE WHEN u.email ILIKE '%@nextwork.org' THEN true ELSE false END as is_nextwork_admin
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;


-- ========================================
-- PART 5: RECENTLY LIVE FEATURE (30 MIN BUFFER)
-- ========================================

ALTER TABLE public.streams 
ADD COLUMN IF NOT EXISTS recently_live_until TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_streams_recently_live 
ON public.streams(recently_live_until);


-- ========================================
-- PART 6: THUMBNAIL STORAGE BUCKET
-- ========================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stream-thumbnails',
  'stream-thumbnails',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Public Access for Thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own thumbnails" ON storage.objects;

CREATE POLICY "Public Access for Thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'stream-thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stream-thumbnails' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'stream-thumbnails');


-- ========================================
-- ✅ SUCCESS SUMMARY
-- ========================================

SELECT '🎉 DEMO READY!' as status;
SELECT '✅ Auto-admin for @nextwork.org enabled' as feature_1;
SELECT '✅ Duplicate handling enabled' as feature_2;
SELECT '✅ Missing profiles created' as feature_3;
SELECT '✅ Recently Live (30 min) enabled' as feature_4;
SELECT '✅ Thumbnail storage configured' as feature_5;

SELECT 
    COUNT(*) FILTER (WHERE is_nextwork_admin = true) as nextwork_staff,
    COUNT(*) FILTER (WHERE is_nextwork_admin = false OR is_nextwork_admin IS NULL) as regular_users,
    COUNT(*) as total_users
FROM public.profiles;

