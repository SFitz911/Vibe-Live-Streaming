import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Use fallback for build time, real values for runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://hjhmgllhkppevwzocvtm.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaG1nbGxoa3BwZXZ3em9jdnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzczODYsImV4cCI6MjA3NzgxMzM4Nn0.yPWzvWueytZpPAHcYwxsW_U2xRlkhK7So59ghXr6Y1g'

// Validate only in runtime, not during build
if (typeof window !== 'undefined') {
  if (!supabaseUrl?.startsWith('https://')) {
    console.error('Invalid Supabase URL:', supabaseUrl)
  }
  if (!supabaseAnonKey) {
    console.error('Missing Supabase anon key')
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Stream = Database['public']['Tables']['streams']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type Follower = Database['public']['Tables']['followers']['Row']

