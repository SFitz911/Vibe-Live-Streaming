'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Radio, User, LogIn, LogOut, Search, Bell, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

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
            <span className="text-2xl font-bold gradient-text">
              Vibe Coding Live
            </span>
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
            {/* Search */}
            <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Search size={20} className="text-muted-foreground" />
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors relative">
              <Bell size={20} className="text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-foreground">
                      {user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">Streamer</p>
                  </div>
                </div>

                {/* Settings */}
                <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Settings size={18} className="text-muted-foreground" />
                </button>

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
                  href="/auth/register"
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