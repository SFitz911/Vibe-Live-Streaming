'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import StreamCard from '@/components/StreamCard'
import Navigation from '@/components/Navigation'
import { Play, Filter, ArrowUp } from 'lucide-react'
import Link from 'next/link'

export default function RecordingsPage() {
  const [streams, setStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views'>('newest')
  const [filterCategory, setFilterCategory] = useState<string>('All')
  const [categories, setCategories] = useState<string[]>(['All'])
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    // Show scroll to top button when scrolled down
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetchRecordings()
  }, [sortBy, filterCategory])

  const fetchRecordings = async () => {
    setLoading(true)

    let query = supabase
      .from('streams')
      .select(`
        *,
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

    // Get ALL recordings (no limit)
    const { data, error } = await query

    if (!error && data) {
      setStreams(data)
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(data.map(s => s.category).filter(Boolean))]
      setCategories(uniqueCategories as string[])
    }

    setLoading(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      
      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Play className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              All Recorded Sessions
            </h1>
            <p className="text-xl text-gray-400">
              Browse {streams.length} recorded streams • Watch anytime, anywhere
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Sort */}
      <section className="py-6 bg-gray-900 border-b border-gray-800 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
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
        </div>
      </section>

      {/* Recordings Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading recordings...</p>
              </div>
            </div>
          ) : streams.length > 0 ? (
            <>
              <div className="mb-6 text-gray-400 text-sm">
                Showing {streams.length} recorded stream{streams.length !== 1 ? 's' : ''}
                {filterCategory !== 'All' && ` in ${filterCategory}`}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {streams.map((stream: any) => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">No Recordings Found</h3>
              <p className="text-gray-400 mb-6">
                {filterCategory !== 'All' 
                  ? `No recordings in ${filterCategory} category` 
                  : 'No recordings available yet'}
              </p>
              <Link 
                href="/" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl transition-all z-50 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </main>
  )
}

