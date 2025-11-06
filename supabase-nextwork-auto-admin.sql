-- ========================================
-- AUTO-ADMIN FOR @NEXTWORK.ORG EMAILS
-- Bulletproof system for demo - handles duplicates
-- ========================================

-- 1. Auto-detect and set admin flag for @nextwork.org emails
CREATE OR REPLACE FUNCTION public.auto_set_nextwork_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if user's email is @nextwork.org
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = NEW.id 
        AND email ILIKE '%@nextwork.org'
    ) THEN
        NEW.is_nextwork_admin := true;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS set_nextwork_admin_on_profile ON public.profiles;
CREATE TRIGGER set_nextwork_admin_on_profile
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_set_nextwork_admin();


-- 2. Enhanced profile upsert (handles duplicates gracefully)
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
    -- Check if @nextwork.org email (case insensitive)
    v_is_admin := p_email ILIKE '%@nextwork.org';
    
    -- Insert or update profile (handle duplicates)
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
        v_is_admin,  -- Auto-verify nextwork.org users
        v_is_admin
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        display_name = EXCLUDED.display_name,
        is_nextwork_admin = EXCLUDED.is_nextwork_admin,
        is_verified = EXCLUDED.is_verified,
        updated_at = NOW();
    
EXCEPTION WHEN OTHERS THEN
    -- Never fail - just log warning
    RAISE WARNING 'Error in upsert_demo_profile for %: %', p_email, SQLERRM;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.upsert_demo_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_demo_profile TO anon;


-- 3. Fix all existing @nextwork.org users (if any missed)
UPDATE public.profiles p
SET 
    is_nextwork_admin = true,
    is_verified = true
FROM auth.users u
WHERE p.id = u.id
AND u.email ILIKE '%@nextwork.org'
AND (p.is_nextwork_admin = false OR p.is_nextwork_admin IS NULL);


-- 4. Success message
SELECT 
    '✅ Auto-admin system activated!' as status,
    COUNT(*) as nextwork_admins
FROM public.profiles
WHERE is_nextwork_admin = true;

