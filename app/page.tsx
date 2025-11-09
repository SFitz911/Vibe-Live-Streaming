'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import StreamCard from '@/components/StreamCard'
import Navigation from '@/components/Navigation'
import TestNotificationButton from '@/components/TestNotificationButton'
import { Flame, TrendingUp, Users, Play, Star, Zap, Eye, Settings, Compass, BookOpen, HelpCircle, FileText, Filter, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [liveStreams, setLiveStreams] = useState<any[]>([])
  const [recentStreams, setRecentStreams] = useState<any[]>([])
  const [displayedStreamCount, setDisplayedStreamCount] = useState(6) // Pagination
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views'>('newest')
  const [filterCategory, setFilterCategory] = useState<string>('All')
  const [categories, setCategories] = useState<string[]>(['All'])
  const [hasMoreStreams, setHasMoreStreams] = useState(false)

  useEffect(() => {
    fetchLiveStreams()
  }, [])

  useEffect(() => {
    fetchRecentStreams()
  }, [sortBy, filterCategory, displayedStreamCount])
  
  // Reset pagination when filters change
  useEffect(() => {
    setDisplayedStreamCount(6)
  }, [sortBy, filterCategory])

  const fetchLiveStreams = async () => {
    // Show streams that are LIVE or recently ended (within 30 minutes) - Optimized query
    const { data, error } = await supabase
      .from('streams')
      .select(`
        id,
        title,
        description,
        category,
        thumbnail_url,
        thumbnail_frozen_url,
        video_30s_url,
        video_12s_url,
        source_type,
        is_live,
        viewer_count,
        created_at,
        user_id,
        profiles (
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .or(`is_live.eq.true,recently_live_until.gte.${new Date().toISOString()}`)
      .order('viewer_count', { ascending: false })
      .limit(12)

    if (!error && data) {
      setLiveStreams(data)
    }
  }

  const fetchRecentStreams = async () => {
    let query = supabase
      .from('streams')
      .select(`
        id,
        title,
        description,
        category,
        thumbnail_url,
        thumbnail_frozen_url,
        video_30s_url,
        video_12s_url,
        playback_url,
        source_type,
        is_live,
        viewer_count,
        created_at,
        user_id,
        profiles (
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('is_live', false)

    // Apply category filter
    if (filterCategory && filterCategory !== 'All') {
      query = query.eq('category', filterCategory)
    }

    // Apply sorting
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else if (sortBy === 'views') {
      query = query.order('viewer_count', { ascending: false })
    }

    // Fetch one extra to check if there are more streams
    query = query.limit(displayedStreamCount + 1)

    const { data, error } = await query

    if (!error && data) {
      // Check if there are more streams
      setHasMoreStreams(data.length > displayedStreamCount)
      
      // Only show the requested amount
      setRecentStreams(data.slice(0, displayedStreamCount))
      
      // Extract unique categories from all recorded streams
      const allRecorded = await supabase
        .from('streams')
        .select('category')
        .eq('is_live', false)
      
      if (allRecorded.data) {
        const uniqueCategories = ['All', ...new Set(allRecorded.data.map(s => s.category).filter(Boolean))]
        setCategories(uniqueCategories as string[])
      }
    }
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <TestNotificationButton />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white" style={{ textShadow: '0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000' }}>
              Nextwork.org
            </h2>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Vibe Coding Live</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Live coding sessions for IT learners and future professionals exploring advanced AI, cloud technologies, and building innovative solutions together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/messages" className="bg-purple-500/20 hover:bg-purple-500/30 border-2 border-purple-500 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center text-lg">
                <MessageSquare className="mr-2" size={20} />
                Messages
              </Link>
              <Link href="/stream/demo-live" className="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center text-lg">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse mr-2"></span>
                Go Live Now
              </Link>
              <Link href="/stream/latest" className="bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center text-lg">
                <Eye className="mr-2" size={20} />
                View Live Event
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Streams Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Flame className="text-red-500" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Live Now</h2>
              <div className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-medium">
                {liveStreams.length} streaming
              </div>
            </div>
            <Link href="/discover" className="text-primary hover:text-primary/80 transition-colors font-medium">
              View All →
            </Link>
          </div>
          
          {liveStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {liveStreams.map((stream: any) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Live Streams</h3>
              <p className="text-muted-foreground mb-6">Be the first to go live and start streaming!</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/stream/demo-live" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
                  Go Live Now
                </Link>
                <Link href="/stream/latest" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center">
                  <Eye className="mr-2" size={18} />
                  View Live Event
                </Link>
                <Link href="/discover" className="btn-secondary">
                  <Compass className="mr-2" size={18} />
                  Browse Streams
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent Streams Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <TrendingUp className="text-blue-500" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Recorded Sessions</h2>
              <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm font-medium">
                Watch Anytime
              </span>
            </div>
            <Link href="/recordings" className="text-primary hover:text-primary/80 transition-colors font-medium">
              View All →
            </Link>
          </div>

          {/* Sorting and Filtering Controls */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Sort By */}
            <div className="flex items-center space-x-3">
              <Filter className="text-gray-400" size={18} />
              <span className="text-sm text-gray-400 font-medium">Sort by:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('newest')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'newest'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setSortBy('oldest')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'oldest'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Oldest
                </button>
                <button
                  onClick={() => setSortBy('views')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'views'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Most Viewed
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {recentStreams.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recentStreams.map((stream: any) => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMoreStreams && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setDisplayedStreamCount(prev => prev + 6)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                  >
                    Load More Streams
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Recorded Streams Yet</h3>
              <p className="text-muted-foreground">Past streams will appear here once they're recorded!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose Vibe Live?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Where IT enthusiasts share their screens, learn to harness advanced AI to create amazing things, and explore cutting-edge technology together. Hangout, experiment, and build your own projects in a collaborative learning environment.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Easy Streaming</h3>
              <p className="text-muted-foreground">Start streaming in minutes with our intuitive setup process.</p>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Real-time Chat</h3>
              <p className="text-muted-foreground">Connect with fellow students and learners through live chat - ask questions, share insights, and collaborate in real-time.</p>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Expert Support</h3>
              <p className="text-muted-foreground">Professional help is just one click away - the Nextwork staff is always here to guide and support you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Footer Section */}
      <section className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Vibe Coding Live</span>
              </div>
              <p className="text-sm text-gray-400">
                Live coding sessions for IT learners and professionals. Learn, build, and grow together.
              </p>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-white mb-4">Help & Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard/stream/setup" className="text-sm text-gray-400 hover:text-primary transition-colors flex items-center">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Troubleshooting
                  </Link>
                </li>
                <li>
                  <Link href="/stream/demo-live" className="text-sm text-gray-400 hover:text-primary transition-colors flex items-center">
                    <Play className="w-4 h-4 mr-2" />
                    Test Your Stream
                  </Link>
                </li>
                <li>
                  <a href="https://nextwork.org" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-primary transition-colors flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="font-semibold text-white mb-4">Community</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard/messages" className="text-sm text-gray-400 hover:text-primary transition-colors">
                    Messages
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-sm text-gray-400 hover:text-primary transition-colors">
                    Creator Dashboard
                  </Link>
                </li>
                <li>
                  <a href="https://nextwork.org" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-primary transition-colors">
                    Nextwork.org
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="font-semibold text-white mb-4">Get Started</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/stream/demo-live" className="text-sm text-gray-400 hover:text-primary transition-colors">
                    Go Live Now
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="text-sm text-gray-400 hover:text-primary transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/stream/setup" className="text-sm text-gray-400 hover:text-primary transition-colors">
                    Troubleshooting
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Vibe Coding Live by{' '}
              <a href="https://nextwork.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Nextwork.org
              </a>
              . Built for learners, by learners.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}