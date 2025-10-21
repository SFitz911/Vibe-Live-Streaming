export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          is_streamer: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_streamer?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_streamer?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      streams: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          stream_key: string
          playback_url: string | null
          is_live: boolean
          viewer_count: number
          category: string | null
          tags: string[] | null
          started_at: string | null
          ended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          stream_key: string
          playback_url?: string | null
          is_live?: boolean
          viewer_count?: number
          category?: string | null
          tags?: string[] | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          stream_key?: string
          playback_url?: string | null
          is_live?: boolean
          viewer_count?: number
          category?: string | null
          tags?: string[] | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          stream_id: string
          user_id: string
          message: string
          is_moderator: boolean
          is_deleted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          stream_id: string
          user_id: string
          message: string
          is_moderator?: boolean
          is_deleted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          stream_id?: string
          user_id?: string
          message?: string
          is_moderator?: boolean
          is_deleted?: boolean
          created_at?: string
        }
      }
      followers: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      stream_views: {
        Row: {
          id: string
          stream_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          view_duration: number
          created_at: string
        }
        Insert: {
          id?: string
          stream_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          view_duration?: number
          created_at?: string
        }
        Update: {
          id?: string
          stream_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          view_duration?: number
          created_at?: string
        }
      }
      stream_moderators: {
        Row: {
          id: string
          stream_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          stream_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          stream_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}

