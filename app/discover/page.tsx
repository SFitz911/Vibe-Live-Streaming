import StreamCard from '@/components/StreamCard'
import Navigation from '@/components/Navigation'
import BackButton from '@/components/BackButton'
import { Search, Radio } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Force no caching for development
export const revalidate = 0
export const dynamic = 'force-dynamic'

const CATEGORIES = [
  'All',
  'AWS Cloud',
  'AI & Machine Learning',
  'Database',
  'MCP',
  'DevOps',
  'Cybersecurity',
  'Web Development',
  'Data Science',
  'Blockchain',
]

async function getLiveStreams(category?: string) {
  // Show streams that are LIVE or recently ended (within 30 minutes)
  const now = new Date().toISOString()
  
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
    .or(`is_live.eq.true,recently_live_until.gte.${now}`)
    .order('viewer_count', { ascending: false })  // Show most popular first
    .order('created_at', { ascending: false })

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching live streams:', error)
    return []
  }

  console.log('=== DISCOVER PAGE DEBUG ===')
  console.log('Category filter:', category || 'All')
  console.log('Live + Recently Live streams found:', data?.length || 0)
  if (data && data.length > 0) {
    console.log('First stream:', JSON.stringify(data[0], null, 2))
    console.log('Has profiles?', !!data[0].profiles)
  }
  console.log('===========================')

  return data || []
}

async function getCategoryCounts() {
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('streams')
    .select('category')
    .or(`is_live.eq.true,recently_live_until.gte.${now}`)

  if (error || !data) return {}

  const counts: { [key: string]: number } = {}
  data.forEach((stream: any) => {
    const cat = stream.category || 'Other'
    counts[cat] = (counts[cat] || 0) + 1
  })
  
  // Add total for "All"
  counts['All'] = data.length
  
  return counts
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const selectedCategory = searchParams.category || 'All'
  const streams = await getLiveStreams(selectedCategory)
  const categoryCounts = await getCategoryCounts()

  console.log('=== RENDERING DISCOVER PAGE ===')
  console.log('Selected category:', selectedCategory)
  console.log('Streams to render:', streams.length)
  console.log('Category counts:', categoryCounts)
  console.log('================================')

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackButton href="/" label="Back to Home" />
        </div>
        
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Radio className="h-8 w-8 text-red-500 animate-pulse" />
            <h1 className="text-3xl font-bold text-white">Live Now</h1>
            <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-medium">
              {streams.length} streaming
            </span>
          </div>
          <p className="text-gray-400">
            Watch live streams from creators around the world
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search streams, creators, or tags..."
              className="w-full bg-gray-900 text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 border border-gray-800"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0
              return (
                <a
                  key={cat}
                  href={`/discover${cat !== 'All' ? `?category=${cat}` : ''}`}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center space-x-2 ${
                    selectedCategory === cat
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
                  }`}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedCategory === cat
                        ? 'bg-white/20 text-white'
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </a>
              )
            })}
          </div>
        </div>

        {/* Live Streams Grid - Scrollable */}
        {streams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
            {streams.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-900 rounded-lg border border-gray-800">
            <Radio className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Live Streams Right Now
            </h3>
            <p className="text-gray-400 mb-4">
              No one is streaming at the moment. Be the first to go live!
            </p>
            <a
              href="/stream/demo-live"
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Streaming
            </a>
          </div>
        )}
      </div>
    </main>
  )
}

