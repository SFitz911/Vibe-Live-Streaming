'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Radio, User, LogIn, LogOut, Search, Bell, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import UserLevelBadge, { calculateUserLevel } from './UserLevelBadge'

export default function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userStreams, setUserStreams] = useState<any[]>([])
  const [userLevel, setUserLevel] = useState({ level: 1, totalPoints: 0 })
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserStreams(session.user.id)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserStreams(session.user.id)
      } else {
        setUserStreams([])
        setUserLevel({ level: 1, totalPoints: 0 })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserStreams = async (userId: string) => {
    const { data } = await supabase
      .from('streams')
      .select('*')
      .eq('user_id', userId)

    if (data) {
      setUserStreams(data)
      setUserLevel(calculateUserLevel(data))
    }

    // Also fetch unread message count
    fetchUnreadCount(userId)
  }

  const fetchUnreadCount = async (userId: string) => {
    const { count } = await supabase
      .from('direct_messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false)

    setUnreadCount(count || 0)
  }

  // Subscribe to new messages for real-time notification updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('nav-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          fetchUnreadCount(user.id)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          fetchUnreadCount(user.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/dashboard', label: 'Dashboard', icon: Radio },
  ]

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-light text-white/80 tracking-wide">
                Nextwork.org
              </span>
              <span className="text-2xl font-bold gradient-text leading-tight">
                Vibe Coding Live
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 group ${
                  pathname === link.href 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <link.icon size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Messages Notification Bell */}
            {user && (
              <Link 
                href="/dashboard/messages"
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors relative"
              >
                <Bell 
                  size={20} 
                  className={unreadCount > 0 ? "text-green-500" : "text-muted-foreground"} 
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="hidden md:flex items-center space-x-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user.email?.split('@')[0] || 'User'}
                      </p>
                      {user.email?.endsWith('@nextwork.org') ? (
                        <p className="text-xs text-yellow-400 font-semibold">
                          Staff-Expert
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Learner</p>
                      )}
                    </div>
                    <UserLevelBadge totalPoints={userLevel.totalPoints} size="small" />
                  </div>
                </div>

                {/* Settings - Links to Help & Troubleshooting */}
                <Link 
                  href="/dashboard/stream/setup"
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Settings size={18} className="text-muted-foreground" />
                </Link>

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="btn-secondary text-sm"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="btn-secondary text-sm"
                >
                  <LogIn size={16} className="mr-2" />
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-primary text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  pathname === link.href 
                    ? 'bg-primary/20 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <link.icon size={16} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}