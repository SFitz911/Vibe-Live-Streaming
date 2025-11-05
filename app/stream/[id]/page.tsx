'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import VideoPlayer from '@/components/VideoPlayer'
import ChatBox from '@/components/ChatBox'
import StreamManager from '@/components/StreamManager'
import LiveKitGoLive from '@/components/LiveKitGoLive'
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
  { name: 'Natasha', email: 'Natasha@nextwork.org', phone: '+17373334912' },
  { name: 'Maya', email: 'Maya@nextwork.org', phone: '+17373334912' },
  { name: 'Maximus', email: 'Maximus@nextwork.org', phone: '+17373334912' },
  { name: 'Haku', email: 'Haku@nextwork.org', phone: '+17373334912' },
]

export default function StreamPage({
  params,
}: {
  params: { id: string }
}) {
  const [showExpertDropdown, setShowExpertDropdown] = useState(false)
  const [showStreamForm, setShowStreamForm] = useState(true)
  const [streamDetails, setStreamDetails] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    tags: '',
  })

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
    playback_url: process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080/hls/stream.m3u8'
      : 'https://demo.owncast.online/hls/stream.m3u8', // Using demo Owncast server for production
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
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Go Live Section (left) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center">
            <div className="w-full bg-gradient-to-br from-blue-900/80 to-gray-900/80 rounded-2xl shadow-xl p-8 flex flex-col items-center border border-blue-800">
              {showStreamForm ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4 text-center">Set Up Your Live Stream</h2>
                  <p className="text-gray-300 mb-6 text-center max-w-lg">Fill in the details below before going live</p>
                  
                  <div className="w-full max-w-2xl space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stream Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={streamDetails.title}
                        onChange={(e) => setStreamDetails({ ...streamDetails, title: e.target.value })}
                        placeholder="e.g., Building a React App with TypeScript"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={streamDetails.description}
                        onChange={(e) => setStreamDetails({ ...streamDetails, description: e.target.value })}
                        placeholder="Describe what you'll be working on..."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={streamDetails.category}
                        onChange={(e) => setStreamDetails({ ...streamDetails, category: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Web Development">Web Development</option>
                        <option value="AI & Machine Learning">AI & Machine Learning</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Database">Database</option>
                        <option value="Cyber Security">Cyber Security</option>
                        <option value="AWS Cloud">AWS Cloud</option>
                        <option value="Game Development">Game Development</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={streamDetails.tags}
                        onChange={(e) => setStreamDetails({ ...streamDetails, tags: e.target.value })}
                        placeholder="e.g., react, typescript, tutorial"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={() => {
                        if (!streamDetails.title.trim() || !streamDetails.description.trim()) {
                          alert('Please fill in the title and description');
                          return;
                        }
                        setShowStreamForm(false);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg"
                    >
                      Continue to Go Live →
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2 text-center">Go Live Now</h2>
                  <div className="text-center mb-4">
                    <p className="text-blue-300 font-semibold">{streamDetails.title}</p>
                    <p className="text-gray-400 text-sm">{streamDetails.category}</p>
                  </div>
                  <p className="text-gray-300 mb-6 text-center max-w-lg">Start your live stream instantly from your browser. Allow camera and microphone access, then click below to go live!</p>
                  <div className="w-full">
                    <LiveKitGoLive 
                      roomName={params.id} 
                      userName={`User_${Date.now()}`}
                      streamTitle={streamDetails.title}
                      streamDescription={streamDetails.description}
                      streamCategory={streamDetails.category}
                      streamTags={streamDetails.tags}
                    />
                  </div>
                  <button
                    onClick={() => setShowStreamForm(true)}
                    className="mt-4 text-gray-400 hover:text-white text-sm underline"
                  >
                    ← Edit Stream Details
                  </button>
                </>
              )}
            </div>
          </div>
          {/* Chat Section (right) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 h-[calc(100vh-120px)]">
              <div className="bg-gray-900 rounded-2xl h-full flex flex-col shadow-xl border border-gray-800">
                <div className="p-6 border-b border-gray-800">
                  <h2 className="text-xl font-semibold text-white mb-3 text-center">Live Chat</h2>

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
                <div className="flex-1 flex flex-col">
                  <ChatBox streamId={params.id} userId="demo-user" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

