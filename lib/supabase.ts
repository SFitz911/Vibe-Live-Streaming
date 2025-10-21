import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zbiwmgtvxlurqyfrzjhd.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaXdtZ3R2eGx1cnF5ZnJ6amhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5Mzg3MjYsImV4cCI6MjA3NjUxNDcyNn0.M0Zb96jq4vYUz0vOBhc_1pVvDOJ3AqkWc4sDGdR6tno'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Stream = Database['public']['Tables']['streams']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type Follower = Database['public']['Tables']['followers']['Row']

