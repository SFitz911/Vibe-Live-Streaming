-- ========================================
-- COMPLETE SETUP FOR VIBE CODING LIVE
-- Run this ONE file in Supabase SQL Editor
-- ========================================

-- STEP 1: Clean up any old data
DELETE FROM public.streams;
DELETE FROM public.profiles WHERE username IN ('techmaster', 'cloudguru', 'aiexpert', 'livestreamer', 'sampleuser');

-- STEP 2: Create Nextwork instructor profiles
INSERT INTO public.profiles (id, username, display_name, is_streamer, is_verified, bio)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'natasha', 'Natasha', true, true, 'Nextwork.org Instructor'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'maya', 'Maya', true, true, 'Nextwork.org Instructor'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'maximus', 'Maximus', true, true, 'Nextwork.org Instructor'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'haku', 'Haku', true, true, 'Nextwork.org Instructor')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, is_verified = EXCLUDED.is_verified;

-- STEP 3: Add LIVE streams (for Discover page) - 5 total
INSERT INTO public.streams (id, user_id, title, description, category, tags, stream_key, playback_url, is_live, viewer_count, started_at, created_at)
VALUES
  ('50000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'AWS Cloud Architecture - Live Session', 'Live AWS tutorial', 'AWS Cloud', ARRAY['aws', 'cloud'], 'live-1', 'ws://localhost:7880/live-1', true, 142, NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'AI Development - Live Coding', 'Live AI coding', 'AI & Machine Learning', ARRAY['ai', 'live'], 'live-2', 'ws://localhost:7880/live-2', true, 256, NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Next.js App - Live Build', 'Live Next.js tutorial', 'Web Development', ARRAY['nextjs', 'live'], 'live-3', 'ws://localhost:7880/live-3', true, 189, NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Kubernetes - Live Deployment', 'Live K8s session', 'DevOps', ARRAY['kubernetes', 'live'], 'live-4', 'ws://localhost:7880/live-4', true, 312, NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'React Patterns - Live', 'Live React coding', 'Web Development', ARRAY['react', 'live'], 'live-5', 'ws://localhost:7880/live-5', true, 98, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- STEP 4: Add RECORDED streams (for Homepage) - Real Nextwork YouTube videos
INSERT INTO public.streams (id, user_id, title, description, category, tags, stream_key, playback_url, is_live, viewer_count, thumbnail_url, started_at, ended_at, created_at)
VALUES
  -- NATASHA (3 videos)
  ('40000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Supabase MCP + Cursor', 'Supabase and Cursor AI integration tutorial', 'AI & Machine Learning', ARRAY['supabase', 'cursor', 'ai'], 'natasha-1', 'https://www.youtube.com/watch?v=H7wYmyipuNQ', false, 1800, 'https://img.youtube.com/vi/H7wYmyipuNQ/maxresdefault.jpg', NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days' + INTERVAL '45 minutes', NOW() - INTERVAL '17 days'),
  ('40000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Claude Code Tutorial 2025', 'Complete Claude Code guide', 'AI & Machine Learning', ARRAY['claude', 'ai', 'tutorial'], 'natasha-2', 'https://www.youtube.com/watch?v=Cn2jjoOIKOE', false, 1000, 'https://img.youtube.com/vi/Cn2jjoOIKOE/maxresdefault.jpg', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '25 minutes', NOW() - INTERVAL '7 days'),
  ('40000000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Build Web Features with Claude', 'Claude Code web development', 'AI & Machine Learning', ARRAY['claude', 'web-dev'], 'natasha-3', 'https://www.youtube.com/watch?v=RfyazQ_ZiD8', false, 1300, 'https://img.youtube.com/vi/RfyazQ_ZiD8/maxresdefault.jpg', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days' + INTERVAL '3 hours', NOW() - INTERVAL '14 days'),
  
  -- MAYA (3 videos)
  ('40000000-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'AWS CodeArtifact Dependencies', 'AWS package management', 'AWS Cloud', ARRAY['aws', 'codeartifact'], 'maya-1', 'https://www.youtube.com/watch?v=f25K0_J3hgo', false, 956, 'https://img.youtube.com/vi/f25K0_J3hgo/maxresdefault.jpg', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '35 minutes', NOW() - INTERVAL '12 days'),
  ('40000000-0000-0000-0000-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'AWS Lex Part 5 - Multiple Slots', 'AWS Lex chatbot tutorial', 'AWS Cloud', ARRAY['aws', 'lex', 'chatbot'], 'maya-2', 'https://www.youtube.com/watch?v=xhmc87tfIZA', false, 1000, 'https://img.youtube.com/vi/xhmc87tfIZA/maxresdefault.jpg', NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months' + INTERVAL '1 hour', NOW() - INTERVAL '5 months'),
  ('40000000-0000-0000-0000-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Build Web Features - Claude Guide', 'Web development with AI', 'Web Development', ARRAY['claude', 'web'], 'maya-3', 'https://www.youtube.com/watch?v=0BTgmA6wgUw', false, 524, 'https://img.youtube.com/vi/0BTgmA6wgUw/maxresdefault.jpg', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days' + INTERVAL '90 minutes', NOW() - INTERVAL '14 days'),
  
  -- MAXIMUS (3 videos)
  ('40000000-0000-0000-0000-000000000007', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Connect Lex with Lambda', 'AWS Lex Lambda integration', 'AWS Cloud', ARRAY['aws', 'lex', 'lambda'], 'maximus-1', 'https://www.youtube.com/live/LfnQtNKTjjc', false, 1734, 'https://img.youtube.com/vi/LfnQtNKTjjc/maxresdefault.jpg', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days' + INTERVAL '80 minutes', NOW() - INTERVAL '16 days'),
  ('40000000-0000-0000-0000-000000000008', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Save User Info - Lex Chatbot', 'Lex chatbot user data', 'AWS Cloud', ARRAY['aws', 'lex'], 'maximus-2', 'https://www.youtube.com/live/HlGJLpJOi-A', false, 1621, 'https://img.youtube.com/vi/HlGJLpJOi-A/maxresdefault.jpg', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days' + INTERVAL '70 minutes', NOW() - INTERVAL '15 days'),
  ('40000000-0000-0000-0000-000000000009', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Deploy with Kubernetes & EKS', 'Kubernetes deployment guide', 'DevOps', ARRAY['kubernetes', 'aws', 'eks'], 'maximus-3', 'https://www.youtube.com/watch?v=lecBtZLDaH0', false, 2134, 'https://img.youtube.com/vi/lecBtZLDaH0/maxresdefault.jpg', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '75 minutes', NOW() - INTERVAL '8 days'),
  
  -- HAKU (2 videos)
  ('40000000-0000-0000-0000-000000000010', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Database with Cursor + Supabase', 'Database design tutorial', 'Database', ARRAY['supabase', 'cursor', 'database'], 'haku-1', 'https://www.youtube.com/watch?v=aK2aRUM0hjE', false, 1400, 'https://img.youtube.com/vi/aK2aRUM0hjE/maxresdefault.jpg', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days' + INTERVAL '150 minutes', NOW() - INTERVAL '11 days'),
  ('40000000-0000-0000-0000-000000000011', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Create Chatbot with Amazon Lex', 'AWS Lex chatbot basics', 'AWS Cloud', ARRAY['aws', 'lex', 'chatbot'], 'haku-2', 'https://www.youtube.com/live/3WQKjgqRPeE', false, 1892, 'https://img.youtube.com/vi/3WQKjgqRPeE/maxresdefault.jpg', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '65 minutes', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- SUCCESS!
SELECT 'Setup complete! ✅ Live streams for Discover, Recorded for Homepage' as message;

