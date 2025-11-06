-- ========================================
-- LIKES & PROJECTS SYSTEM
-- Run this in Supabase SQL Editor
-- ========================================

-- ========================================
-- TABLE: stream_likes
-- ========================================
CREATE TABLE IF NOT EXISTS public.stream_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id UUID REFERENCES public.streams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(stream_id, user_id)  -- One like per user per stream
);

-- Enable RLS
ALTER TABLE public.stream_likes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Likes are viewable by everyone"
    ON public.stream_likes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can like"
    ON public.stream_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own"
    ON public.stream_likes FOR DELETE
    USING (auth.uid() = user_id);

-- ========================================
-- TABLE: nextwork_projects
-- ========================================
CREATE TABLE IF NOT EXISTS public.nextwork_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT DEFAULT 'Intermediate',
    category TEXT,
    xp_reward INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.nextwork_projects ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Projects viewable by everyone"
    ON public.nextwork_projects FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage projects"
    ON public.nextwork_projects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_nextwork_admin = true
        )
    );

-- ========================================
-- TABLE: user_project_completions
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_project_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.nextwork_projects(id) ON DELETE CASCADE NOT NULL,
    verified_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)  -- One completion per user per project
);

-- Enable RLS
ALTER TABLE public.user_project_completions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Completions viewable by everyone"
    ON public.user_project_completions FOR SELECT
    USING (true);

CREATE POLICY "Only admins can mark completions"
    ON public.user_project_completions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_nextwork_admin = true
        )
    );

CREATE POLICY "Only admins can delete completions"
    ON public.user_project_completions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_nextwork_admin = true
        )
    );

-- ========================================
-- UPDATE: Add is_nextwork_admin to profiles
-- ========================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_nextwork_admin BOOLEAN DEFAULT false;

-- Auto-set admin flag for @nextwork.org emails
UPDATE public.profiles
SET is_nextwork_admin = true
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '%@nextwork.org'
);

-- ========================================
-- SEED: Insert Nextwork Projects
-- ========================================
INSERT INTO public.nextwork_projects (title, description, difficulty, category, xp_reward)
VALUES
    ('Build a Chatbot with Amazon Lex', 'Create an intelligent chatbot using AWS Lex service', 'Intermediate', 'AWS Cloud', 20),
    ('Deploy with Kubernetes & EKS', 'Learn container orchestration and AWS EKS deployment', 'Advanced', 'DevOps', 20),
    ('Database Design with Supabase & Cursor', 'Build a complete database with Supabase and Cursor AI', 'Beginner', 'Database', 20),
    ('AWS CodeArtifact for Dependencies', 'Set up package management with AWS CodeArtifact', 'Intermediate', 'AWS Cloud', 20),
    ('Build Web Features with Claude Code', 'Use Claude AI to build web application features', 'Intermediate', 'AI & Machine Learning', 20),
    ('Supabase MCP + Cursor Integration', 'Integrate Supabase with Cursor AI using MCP', 'Advanced', 'AI & Machine Learning', 20),
    ('AWS Lex Multi-Slot Conversations', 'Build complex chatbot conversations with multiple slots', 'Intermediate', 'AWS Cloud', 20),
    ('Connect AWS Lex with Lambda Functions', 'Integrate Lex chatbot with AWS Lambda backend', 'Advanced', 'AWS Cloud', 20),
    ('Save User Info in Lex Chatbot', 'Implement user data persistence in AWS Lex', 'Intermediate', 'AWS Cloud', 20),
    ('Next.js Full-Stack Application', 'Build a complete Next.js application from scratch', 'Intermediate', 'Web Development', 20)
ON CONFLICT DO NOTHING;

-- ========================================
-- INDEXES for Performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_stream_likes_stream_id ON public.stream_likes(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_likes_user_id ON public.stream_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON public.user_project_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_project_id ON public.user_project_completions(project_id);

-- ========================================
-- FUNCTION: Auto-set admin flag on new users
-- ========================================
CREATE OR REPLACE FUNCTION public.check_nextwork_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if email ends with @nextwork.org
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = NEW.id 
        AND email LIKE '%@nextwork.org'
    ) THEN
        NEW.is_nextwork_admin = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_admin_flag ON public.profiles;
CREATE TRIGGER set_admin_flag
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.check_nextwork_admin();

-- Success message
SELECT '✅ Likes & Projects system created successfully!' as message;
SELECT 'Admin access enabled for @nextwork.org emails' as message;
SELECT COUNT(*) || ' Nextwork projects loaded' as message FROM public.nextwork_projects;

