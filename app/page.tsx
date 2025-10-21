import { supabase } from '@/lib/supabase'
import StreamCard from '@/components/StreamCard'
import Navigation from '@/components/Navigation'
import { Flame, TrendingUp } from 'lucide-react'

export const revalidate = 0

async function getLiveStreams() {
  const { data, error } = await supabase
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
    .eq('is_live', true)
    .order('viewer_count', { ascending: false })
    .limit(12)

  if (error) {
    console.error('Error fetching live streams:', error)
    return []
  }

  return data || []
}

async function getRecentStreams() {
  const { data, error } = await supabase
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
    .limit(12)

  if (error) {
    console.error('Error fetching recent streams:', error)
    return []
  }

  return data || []
}

export default async function HomePage() {
  const liveStreams = await getLiveStreams()
  const recentStreams = await getRecentStreams()

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-primary-400 to-purple-600 bg-clip-text text-transparent">
            Welcome to Vibe Live
          </h1>
          <p className="text-xl text-gray-400">
            Your own self-hosted livestreaming platform
          </p>
        </div>

        {/* Live Streams Section */}
        {liveStreams.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <Flame className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-bold text-white">Live Now</h2>
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                {liveStreams.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {liveStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Streams Section */}
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="h-6 w-6 text-primary-500" />
            <h2 className="text-2xl font-bold text-white">Recent Streams</h2>
          </div>
          {recentStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-900 rounded-lg">
              <p className="text-gray-400 text-lg mb-4">No streams yet</p>
              <p className="text-gray-500">Be the first to go live!</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

