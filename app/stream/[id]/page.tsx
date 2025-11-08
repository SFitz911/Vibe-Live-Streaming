'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import BackButton from '@/components/BackButton'
import VideoPlayer from '@/components/VideoPlayer'
import ChatBox from '@/components/ChatBox'
import StreamManager from '@/components/StreamManager'
import LiveKitGoLive from '@/components/LiveKitGoLive'
import { formatViewerCount, timeAgo } from '@/lib/utils'
import { Eye, Heart, Share2, User, ChevronDown, Mail } from 'lucide-react'
import { notFound, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

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
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [showExpertDropdown, setShowExpertDropdown] = useState(false)
  const [showStreamForm, setShowStreamForm] = useState(true)
  const [streamDetails, setStreamDetails] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    tags: '',
  })
  const [stream, setStream] = useState<any>(null)
  const [streamLoading, setStreamLoading] = useState(true)
  const [activeStream, setActiveStream] = useState<any>(null)

  // Check for active stream when user is authenticated
  useEffect(() => {
    const checkActiveStream = async () => {
      if (!user) return
      
      // Check if user has an active live stream (different from current page)
      const { data: liveStream } = await supabase
        .from('streams')
        .select('id, title')
        .eq('user_id', user.id)
        .eq('is_live', true)
        .neq('id', params.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .single()
      
      if (liveStream) {
        setActiveStream(liveStream)
      }
    }

    checkActiveStream()
  }, [user, params.id])

  // Fetch stream data
  useEffect(() => {
    const fetchStream = async () => {
      // Special case: demo-live is always for creating new streams
      if (params.id === 'demo-live') {
        setStream({ id: 'demo-live', is_live: false, isGoLivePage: true })
        setStreamLoading(false)
        return
      }

      // Fetch actual stream from database
      const { data, error } = await supabase
        .from('streams')
        .select(`
          *,
          profiles (
            username,
            display_name,
            avatar_url,
            is_verified,
            bio
          )
        `)
        .eq('id', params.id)
        .single()

      if (error || !data) {
        console.error('Error fetching stream:', error)
        setStream(null)
      } else {
        setStream(data)
        
        // Populate form with existing stream data if available
        if ((data as any).title || (data as any).description || (data as any).category) {
          setStreamDetails({
            title: (data as any).title || '',
            description: (data as any).description || '',
            category: (data as any).category || 'Web Development',
            tags: (data as any).tags ? (data as any).tags.join(', ') : '',
          })
          // If stream has all details, hide the form and go straight to "Go Live" button
          if ((data as any).title && (data as any).category) {
            setShowStreamForm(false)
          }
        }
      }
      
      setStreamLoading(false)
    }

    fetchStream()
  }, [params.id])

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  // Require authentication to stream
  if (!user) {
    return (
      <main className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
            <p className="text-gray-400 mb-6">
              You need to be signed in to start streaming.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/auth/login"
                className="bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Sign In
              </a>
              <a
                href="/auth/signup"
                className="bg-gray-500/20 hover:bg-gray-500/30 border-2 border-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const handleContactExpert = async (expert: typeof EXPERTS[0]) => {
    const requesterName = profile?.display_name || user?.email || 'Stream Viewer'
    const streamUrl = `${window.location.origin}/stream/${params.id}`
    
    // Trigger expert notification UI
    const event = new CustomEvent('expertHelpRequest', {
      detail: {
        id: `help-${Date.now()}`,
        requesterName,
        topic: `Assistance needed on stream: ${stream?.title || 'Live Stream'}`,
        urgency: 'medium',
        timestamp: new Date().toISOString(),
        streamId: params.id,
      }
    })
    window.dispatchEvent(event)

    // Send email & SMS notification to expert
    try {
      const response = await fetch('/api/expert/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertEmail: expert.email,
          expertPhone: expert.phone,
          expertName: expert.name,
          requesterName,
          requesterEmail: user?.email,
          topic: `Help needed on: ${stream?.title || 'Live Stream'}`,
          urgency: 'medium',
          streamId: params.id,
          streamUrl,
        }),
      })

      if (response.ok) {
        alert(`✅ ${expert.name} has been notified!\n\n📧 Email sent to ${expert.email}\n💬 Text message sent to their phone\n\nThey should respond soon!`)
      } else {
        throw new Error('Notification failed')
      }
    } catch (error) {
      console.error('Notification error:', error)
      // Fallback to manual contact
      alert(`⚠️ Automatic notification failed.\n\nManually contacting ${expert.name}...\n\nEmail: ${expert.email}\nPhone: ${expert.phone}`)
      window.open(`mailto:${expert.email}?subject=Help Request from Nextwork Live Stream&body=Hi ${expert.name},%0D%0A%0D%0AI need help with the stream: ${streamUrl}`, '_blank')
    }

    setShowExpertDropdown(false)
  }

  // Show loading while fetching stream
  if (streamLoading) {
    return (
      <main className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading stream...</p>
          </div>
        </div>
      </main>
    )
  }

  // Stream not found
  if (!stream) {
    return (
      <main className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">📹</div>
            <h2 className="text-2xl font-bold text-white mb-4">Stream Not Found</h2>
            <p className="text-gray-400 mb-6">This stream doesn't exist or has been deleted.</p>
            <a href="/discover" className="bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block">
              Browse Live Streams
            </a>
          </div>
        </div>
      </main>
    )
  }

  // Determine if this is a "Go Live" page or a "Watch Recording" page
  const isOwner = stream.user_id === user?.id
  
  // Check if stream has a valid recording (Supabase .webm or YouTube URL)
  const hasValidRecording = stream.playback_url && (
    stream.playback_url.includes('supabase') || 
    stream.playback_url.includes('youtube.com') ||
    stream.playback_url.includes('youtu.be')
  )
  
  // Debug logging
  console.log('Stream playback check:', {
    streamId: stream.id,
    title: stream.title,
    is_live: stream.is_live,
    playback_url: stream.playback_url,
    hasValidRecording,
    isOwner
  })
  
  // Show recorded video player if stream is not live AND has a valid playback URL
  // PRIORITY: If there's a recording, ALWAYS show the player (even for owners)
  const isRecordedStream = !stream.is_live && hasValidRecording
  
  // Show Go Live interface ONLY if:
  // 1. It's the demo-live page (stream.isGoLivePage), OR
  // 2. User owns the stream AND it's NOT a finished recording AND stream hasn't ended yet
  const isGoLivePage = stream.isGoLivePage || (isOwner && !hasValidRecording && !stream.ended_at)

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (left) - Video Player OR Go Live Interface */}
          <div className="lg:col-span-2">
            {isRecordedStream ? (
              /* Show Video Player for Recorded Streams */
              <div className="w-full">
                <VideoPlayer playbackUrl={stream.playback_url} isLive={false} autoplay={false} muted={false} />
                
                {/* Stream Info Below Video */}
                <div className="mt-6 bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h1 className="text-2xl font-bold text-white mb-2">{stream.title}</h1>
                  <p className="text-gray-400 mb-4">{stream.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{formatViewerCount(stream.viewer_count)} views</span>
                    {stream.category && <span>{stream.category}</span>}
                    <span>{timeAgo(stream.created_at)} ago</span>
                  </div>
                </div>
              </div>
            ) : isGoLivePage ? (
              /* Show Go Live Interface for demo-live or streamer's own streams */
              <div className="w-full bg-gradient-to-br from-blue-900/80 to-gray-900/80 rounded-2xl shadow-xl p-8 flex flex-col items-center border border-blue-800">
                {showStreamForm ? (
                <>
                  <div className="w-full max-w-2xl mb-4">
                    <BackButton href="/dashboard" label="Back to Dashboard" className="text-white/70 hover:text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-4 text-center">Set Up Your Live Stream</h2>
                  <p className="text-gray-300 mb-6 text-center max-w-lg">Fill in the details below before going live</p>
                  
                  {activeStream && (
                    <div className="w-full max-w-2xl mb-6 p-4 rounded-lg bg-green-500/10 border-2 border-green-500 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-green-400 mb-1">
                          🔴 You Have an Active Stream
                        </h3>
                        <p className="text-sm text-gray-300">
                          "{activeStream.title}" is currently live
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/stream/${activeStream.id}`)}
                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                      >
                        Return to Stream
                      </button>
                    </div>
                  )}
                  
                  <div className="w-full max-w-2xl space-y-4">
                    {/* Streamer Name (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Streamer Name
                      </label>
                      <input
                        type="text"
                        value={
                          profile 
                            ? `${profile.display_name || profile.username} (@${profile.username})` 
                            : user?.email 
                            ? user.email.split('@')[0] + ' (Preparing profile...)'
                            : 'Loading...'
                        }
                        readOnly
                        disabled
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {!profile && user ? '⚠️ Profile loading - if this persists, refresh the page' : 'This is automatically set based on your account'}
                      </p>
                    </div>

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
                      className="w-full bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
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
                      userName={profile?.username || `User_${Date.now()}`}
                      userId={user?.id}
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
            ) : (
              /* Stream has ended without a recording */
              <div className="w-full bg-gray-900 rounded-2xl shadow-xl p-12 flex flex-col items-center border border-gray-800">
                <div className="text-6xl mb-6">📹</div>
                <h2 className="text-2xl font-bold text-white mb-4 text-center">Stream Has Ended</h2>
                <p className="text-gray-400 text-center max-w-lg mb-6">
                  This stream has ended and no recording is available.
                </p>
                <a
                  href="/discover"
                  className="bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Browse Live Streams
                </a>
              </div>
            )}
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

