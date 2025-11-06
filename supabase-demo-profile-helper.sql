-- ========================================
-- DEMO PROFILE HELPER FUNCTION
-- Ensures profiles always get created for demo users
-- ========================================

-- Create a function that bypasses RLS to create profiles
CREATE OR REPLACE FUNCTION public.create_profile_if_not_exists(
    p_id UUID,
    p_username TEXT,
    p_display_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with elevated privileges to bypass RLS
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, is_streamer, is_verified)
    VALUES (p_id, p_username, p_display_name, true, false)
    ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name;
    
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Error in create_profile_if_not_exists for user %: %', p_id, SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_profile_if_not_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_profile_if_not_exists TO anon;

-- Success message
SELECT '✅ Demo profile helper function created!' as message;

