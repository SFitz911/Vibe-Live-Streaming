-- ========================================
-- DIRECT MESSAGES SYSTEM
-- Private messaging between users
-- ========================================

-- Create direct_messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON public.direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation ON public.direct_messages(sender_id, recipient_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for direct_messages
DROP POLICY IF EXISTS "Users can view their own messages" ON public.direct_messages;
CREATE POLICY "Users can view their own messages"
ON public.direct_messages FOR SELECT
USING (
  auth.uid() = sender_id OR 
  auth.uid() = recipient_id
);

DROP POLICY IF EXISTS "Users can send messages" ON public.direct_messages;
CREATE POLICY "Users can send messages"
ON public.direct_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their own sent messages" ON public.direct_messages;
CREATE POLICY "Users can update their own sent messages"
ON public.direct_messages FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Enable Realtime for instant messaging
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- Success message
SELECT '✅ Direct messages table created!' as status;
SELECT '💬 Users can now send private messages' as feature;
SELECT '🔔 Realtime enabled for instant notifications' as realtime;

