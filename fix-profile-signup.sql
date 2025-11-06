-- ========================================
-- FIX: Profile Signup Error
-- ========================================
-- Problem: "new row violates row-level security policy for table 'profiles'"
-- Cause: Missing INSERT policy for profiles table
-- Solution: Add INSERT policy to allow users to create their own profile
-- ========================================

-- Add INSERT policy for profiles table
-- This allows authenticated users to create their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Verify policies are set correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Success message
SELECT '✅ Profile signup policy fixed! Users can now create accounts.' as message;

