import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Stream = Database['public']['Tables']['streams']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type Follower = Database['public']['Tables']['followers']['Row']

