import { supabase } from '@/lib/supabase'
import StreamCard from '@/components/StreamCard'
import Navigation from '@/components/Navigation'
import { Flame, TrendingUp, Users, Play, Star, Zap } from 'lucide-react'

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
    <main className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Vibe Live</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The ultimate platform for live streaming, connecting creators with their audience in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary text-lg px-8 py-4">
                <Play className="mr-2" size={20} />
                Start Streaming
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                <Users className="mr-2" size={20} />
                Discover Streams
              </button>
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
            <button className="text-primary hover:text-primary/80 transition-colors font-medium">
              View All →
            </button>
          </div>
          
          {liveStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {liveStreams.map((stream) => (
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
              <button className="btn-primary">
                <Zap className="mr-2" size={18} />
                Start Your Stream
              </button>
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
              <h2 className="text-3xl font-bold text-foreground">Trending</h2>
            </div>
            <button className="text-primary hover:text-primary/80 transition-colors font-medium">
              View All →
            </button>
          </div>
          
          {recentStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Recent Streams</h3>
              <p className="text-muted-foreground">Check back later for new content!</p>
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
              Professional streaming tools and features designed for creators of all levels.
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
              <p className="text-muted-foreground">Engage with your audience through live chat and interactions.</p>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Professional Quality</h3>
              <p className="text-muted-foreground">High-quality streaming with advanced features and analytics.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}