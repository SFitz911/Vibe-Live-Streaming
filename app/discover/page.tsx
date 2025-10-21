import { supabase } from '@/lib/supabase'
import StreamCard from '@/components/StreamCard'
import Navigation from '@/components/Navigation'
import { Search } from 'lucide-react'

export const revalidate = 0

const CATEGORIES = [
  'All',
  'Gaming',
  'Music',
  'Sports',
  'Technology',
  'Education',
  'Entertainment',
  'Art',
  'Talk Shows',
  'IRL',
]

async function getStreams(category?: string) {
  let query = supabase
    .from('streams')
    .select(`
      *,
      profiles:user_id (
        username,
        display_name,
        avatar_url,
        is_verified
      )
    `)
    .order('created_at', { ascending: false })
    .limit(24)

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching streams:', error)
    return []
  }

  return data || []
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const selectedCategory = searchParams.category || 'All'
  const streams = await getStreams(selectedCategory)

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Discover</h1>
          <p className="text-gray-400">
            Explore streams from creators around the world
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
            {CATEGORIES.map((cat) => (
              <a
                key={cat}
                href={`/discover${cat !== 'All' ? `?category=${cat}` : ''}`}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
                }`}
              >
                {cat}
              </a>
            ))}
          </div>
        </div>

        {/* Streams Grid */}
        {streams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {streams.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-900 rounded-lg border border-gray-800">
            <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No streams found
            </h3>
            <p className="text-gray-400">
              Try a different category or check back later
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

