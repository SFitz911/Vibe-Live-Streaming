'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { Profile } from './supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Handle browser close - end all active streams
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user) {
        try {
          const { data: activeStreams } = await supabase
            .from('streams')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_live', true)
          
          if (activeStreams && activeStreams.length > 0) {
            // Use sendBeacon for reliable cleanup
            for (const stream of activeStreams) {
              navigator.sendBeacon('/api/streams/livekit-end', 
                JSON.stringify({ streamId: stream.id }))
            }
          }
        } catch (error) {
          console.error('Error ending streams on browser close:', error)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [user])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) return { error: authError }

    // Then create the profile
    if (authData.user) {
      // Auto-generate username and display name from email
      const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
      const username = emailPrefix + '_' + authData.user.id.substring(0, 6)
      const displayName = email.split('@')[0]
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          display_name: displayName,
          is_streamer: true,
          is_verified: false,
        })

      if (profileError) return { error: profileError }
    }

    return { error: null }
  }

  const signOut = async () => {
    // End all active streams before signing out (but don't block sign out if it fails)
    if (user) {
      try {
        const { data: activeStreams } = await supabase
          .from('streams')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_live', true)
        
        if (activeStreams && activeStreams.length > 0) {
          // End each active stream (fire and forget)
          activeStreams.forEach(stream => {
            fetch('/api/streams/livekit-end', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ streamId: stream.id }),
            }).catch(() => {})
          })
        }
      } catch (error) {
        // Silently fail - don't block sign out
        console.log('Stream cleanup skipped:', error)
      }
    }
    
    // Always sign out, even if stream cleanup fails
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

