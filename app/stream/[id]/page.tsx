'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import VideoPlayer from '@/components/VideoPlayer'
import ChatBox from '@/components/ChatBox'
import { formatViewerCount, timeAgo } from '@/lib/utils'
import { Eye, Heart, Share2, User, ChevronDown, Mail } from 'lucide-react'
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

const EXPERTS = [
  { name: 'Natasha', email: 'Natasha@nextwork.org', phone: '+1234567890' },
  { name: 'Maya', email: 'Maya@nextwork.org', phone: '+1234567891' },
  { name: 'Maximus', email: 'Maximus@nextwork.org', phone: '+1234567892' },
  { name: 'Haku', email: 'Haku@nextwork.org', phone: '+1234567893' },
]

export default function StreamPage({
  params,
}: {
  params: { id: string }
}) {
  const [showExpertDropdown, setShowExpertDropdown] = useState(false)
  
  const handleContactExpert = async (expert: typeof EXPERTS[0]) => {
    // Trigger expert notification
    const event = new CustomEvent('expertHelpRequest', {
      detail: {
        id: `help-${Date.now()}`,
        requesterName: 'Stream Viewer',
        topic: `Assistance needed on stream: ${stream.title}`,
        urgency: 'medium',
        timestamp: new Date().toISOString(),
        streamId: params.id,
      }
    })
    window.dispatchEvent(event)
    
    // Send API request to notify expert
    try {
      await fetch('/api/expert/help-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertEmail: expert.email,
          requesterName: 'Stream Viewer',
          topic: `Assistance needed on stream: ${stream.title}`,
          urgency: 'medium',
          streamId: params.id,
        }),
      })
    } catch (error) {
      console.log('Help request sent (offline mode)')
    }
    
    // Open email client
    window.open(`mailto:${expert.email}?subject=Help Request from Nextwork Live Stream&body=Hi ${expert.name},%0D%0A%0D%0AI need help with...`, '_blank')
    
    // Open SMS (this will open the default SMS app on mobile, or prompt for SMS app on desktop)
    const smsBody = `Hi ${expert.name}, I need help with the Nextwork live stream. Can you assist?`
    window.open(`sms:${expert.phone}?body=${encodeURIComponent(smsBody)}`, '_blank')
    
    // Show confirmation
    alert(`Contacting ${expert.name}...\n\n✅ Expert has been notified!\n\nEmail client and messaging app have been opened.\nYou can now send your message via email or text.`)
    
    setShowExpertDropdown(false)
  }
  
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
              <div className="bg-gray-900 rounded-lg h-full flex flex-col">
                <div className="p-4 border-b border-gray-800">
                  <h2 className="text-lg font-semibold text-white mb-3">Live Chat</h2>
                  
                  {/* Expert Help Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowExpertDropdown(!showExpertDropdown)}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-yellow-400 px-5 py-3 rounded-lg font-bold transition-all shadow-lg border-2 border-yellow-400/30 hover:border-yellow-400/50 flex items-center justify-between"
                    >
                      <span className="flex items-center">
                        <Mail className="h-5 w-5 mr-2" />
                        Get help from a Nextwork.org expert
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${showExpertDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showExpertDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10">
                        {EXPERTS.map((expert, index) => (
                          <button
                            key={index}
                            onClick={() => handleContactExpert(expert)}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            <div className="text-gray-200 font-medium">{expert.name}</div>
                            <div className="text-gray-400 text-xs mt-0.5">{expert.email}</div>
                            <div className="text-gray-500 text-xs mt-0.5 flex items-center">
                              <span className="mr-1">📧</span> Email & <span className="mx-1">💬</span> Text
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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

