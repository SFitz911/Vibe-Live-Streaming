import Navigation from '@/components/Navigation'
import VideoPlayer from '@/components/VideoPlayer'
import ChatBox from '@/components/ChatBox'
import { formatViewerCount, timeAgo } from '@/lib/utils'
import { Eye, Heart, Share2, User } from 'lucide-react'
import { notFound } from 'next/navigation'

// Temporarily disabled for deployment
// async function getStream(id: string) {
//   const { data, error } = await supabase
//     .from('streams')
//     .select(`
//       *,
//       profiles:user_id (
//         id,
//         username,
//         display_name,
//         avatar_url,
//         bio,
//         is_verified
//       )
//     `)
//     .eq('id', id)
//     .single()

//   if (error || !data) {
//     return null
//   }

//   return data
// }

// async function getFollowerCount(userId: string) {
//   const { count } = await supabase
//     .from('followers')
//     .select('*', { count: 'exact', head: true })
//     .eq('following_id', userId)

//   return count || 0
// }

export default function StreamPage({
  params,
}: {
  params: { id: string }
}) {
  // Temporarily disable data fetching for deployment
  const stream = {
    id: params.id,
    title: 'Sample Stream',
    description: 'This is a sample stream',
    user_id: 'sample-user',
    is_live: true,
    viewer_count: 0,
    created_at: new Date().toISOString(),
    playback_url: 'https://sample.m3u8',
    category: 'Gaming',
    tags: ['gaming', 'live', 'streaming'],
    profiles: {
      username: 'sampleuser',
      display_name: 'Sample User',
      avatar_url: null,
      is_verified: false,
      bio: 'This is a sample bio for the streamer.',
    }
  }

  const followerCount = 0

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {stream.is_live && stream.playback_url ? (
                <VideoPlayer playbackUrl={stream.playback_url} autoplay />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Stream Offline
                    </h3>
                    <p className="text-gray-400">
                      This stream is not currently live
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Info */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-2xl font-bold text-white">
                      {stream.title}
                    </h1>
                    {stream.is_live && (
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center space-x-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        <span>LIVE</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{formatViewerCount(stream.viewer_count)} viewers</span>
                    </div>
                    {stream.category && (
                      <span className="text-primary-400">{stream.category}</span>
                    )}
                    {!stream.is_live && stream.created_at && (
                      <span>{timeAgo(stream.created_at)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {stream.description && (
                <p className="text-gray-300 mb-4">{stream.description}</p>
              )}

              {/* Streamer Info */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                    {stream.profiles?.display_name?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-semibold">
                        {stream.profiles?.display_name || 'Unknown'}
                      </h3>
                      {stream.profiles?.is_verified && (
                        <span className="text-primary-400">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {followerCount} followers
                    </p>
                  </div>
                </div>
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                  Follow
                </button>
              </div>

              {stream.profiles?.bio && (
                <p className="mt-4 text-sm text-gray-400">
                  {stream.profiles.bio}
                </p>
              )}

              {stream.tags && stream.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {stream.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 h-[calc(100vh-120px)]">
              <div className="bg-gray-900 rounded-lg h-full">
                <div className="p-4 border-b border-gray-800">
                  <h2 className="text-lg font-semibold text-white">Live Chat</h2>
                </div>
                <ChatBox streamId={params.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

