'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { supabase, Stream } from '@/lib/supabase'
import { Video, Plus, Settings, BarChart3, Users, Trash2, Youtube, Award, ThumbsUp, Shield, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { formatViewerCount, timeAgo } from '@/lib/utils'
import UserLevelBadge, { calculateUserLevel } from '@/components/UserLevelBadge'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [streams, setStreams] = useState<Stream[]>([])
  const [activeStream, setActiveStream] = useState<any>(null)
  const [projectsCompleted, setProjectsCompleted] = useState(0)
  const [totalLikesReceived, setTotalLikesReceived] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)
      await fetchStreams(session.user.id)
      await fetchProjectsAndLikes(session.user.id)
      
      // Check for active live stream
      const { data: liveStream } = await supabase
        .from('streams')
        .select('id, title')
        .eq('user_id', session.user.id)
        .eq('is_live', true)
        .order('started_at', { ascending: false })
        .limit(1)
        .single()
      
      if (liveStream) {
        setActiveStream(liveStream)
      }
      
      setLoading(false)
    }

    checkUser()
  }, [router])

  const fetchProjectsAndLikes = async (userId: string) => {
    // Fetch projects completed
    const { count: projectCount } = await supabase
      .from('user_project_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    setProjectsCompleted(projectCount || 0)

    // Fetch total likes across all user's streams
    const { data: userStreams } = await supabase
      .from('streams')
      .select('id')
      .eq('user_id', userId)

    if (userStreams && userStreams.length > 0) {
      const streamIds = userStreams.map(s => s.id)
      const { count: likeCount } = await supabase
        .from('stream_likes')
        .select('*', { count: 'exact', head: true })
        .in('stream_id', streamIds)
      setTotalLikesReceived(likeCount || 0)
    }
  }

  const fetchStreams = async (userId: string) => {
    const { data, error } = await supabase
      .from('streams')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data && !error) {
      setStreams(data)
    }
  }

  const handleEndStream = async (streamId: string) => {
    if (!confirm('Are you sure you want to end this stream?')) {
      return
    }

    try {
      const response = await fetch('/api/streams/livekit-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId }),
      })

      if (response.ok) {
        // Update local state
        setStreams(streams.map(s => 
          s.id === streamId ? { ...s, is_live: false, ended_at: new Date().toISOString() } : s
        ))
        alert('Stream ended successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to end stream: ${error.message}`)
      }
    } catch (error) {
      console.error('Error ending stream:', error)
      alert('Failed to end stream')
    }
  }

  const handleDeleteStream = async (streamId: string) => {
    if (!confirm('Are you sure you want to delete this stream? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/streams/${streamId}/delete`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from local state
        setStreams(streams.filter(s => s.id !== streamId))
        alert('Stream deleted successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to delete stream: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting stream:', error)
      alert('Failed to delete stream')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-white">Loading...</div>
        </div>
      </main>
    )
  }

  const liveStream = streams.find(s => s.is_live)
  const totalViews = streams.reduce((acc, s) => acc + s.viewer_count, 0)
  const { level, totalPoints, breakdown } = calculateUserLevel(streams, projectsCompleted, totalLikesReceived)
  const isNextworkAdmin = true // Show admin button to everyone for demo

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Creator Dashboard
            </h1>
            <p className="text-gray-400">
              Manage your streams and engage with your audience
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {isNextworkAdmin && (
              <Link
                href="/dashboard/admin"
                className="bg-yellow-500/20 hover:bg-yellow-500/30 border-2 border-yellow-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <Shield className="h-5 w-5" />
                <span>Admin Dashboard</span>
              </Link>
            )}
            <UserLevelBadge totalPoints={totalPoints} size="medium" />
          </div>
        </div>

        {/* Active Stream Alert */}
        {activeStream && (
          <div className="mb-6 p-6 rounded-lg bg-green-500/10 border-2 border-green-500 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-1 flex items-center">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                Live Stream Active
              </h3>
              <p className="text-sm text-gray-300">
                "{activeStream.title}" is currently streaming
              </p>
            </div>
            <button
              onClick={() => router.push(`/stream/${activeStream.id}`)}
              className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500 text-white font-medium rounded-lg transition-colors"
            >
              Go to Stream
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Total Streams</h3>
              <Video className="h-5 w-5 text-primary-500" />
            </div>
            <p className="text-3xl font-bold text-white">{streams.length}</p>
            <p className="text-xs text-gray-500 mt-1">+{breakdown.streamPoints} XP</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Total Views</h3>
              <BarChart3 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white">
              {formatViewerCount(totalViews)}
            </p>
            <p className="text-xs text-gray-500 mt-1">+{breakdown.viewPoints} XP</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Nextwork Projects</h3>
              <Award className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-white">{projectsCompleted}</p>
            <p className="text-xs text-gray-500 mt-1">+{breakdown.projectPoints} XP</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Total Likes</h3>
              <ThumbsUp className="h-5 w-5 text-pink-500" />
            </div>
            <p className="text-3xl font-bold text-white">{totalLikesReceived}</p>
            <p className="text-xs text-gray-500 mt-1">+{breakdown.likePoints} XP</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Live Now</h3>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-3xl font-bold text-white">
              {liveStream ? '1' : '0'}
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Followers</h3>
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/stream/new"
              className="bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500 text-white p-6 rounded-lg flex items-center space-x-3 transition-colors"
            >
              <Plus className="h-6 w-6" />
              <span className="font-semibold">Create New Stream</span>
            </Link>

            <Link
              href="/dashboard/import-youtube"
              className="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 text-white p-6 rounded-lg flex items-center space-x-3 transition-colors"
            >
              <Youtube className="h-6 w-6" />
              <span className="font-semibold">Import YouTube</span>
            </Link>
            
            <Link
              href="/dashboard/messages"
              className="bg-purple-500/20 hover:bg-purple-500/30 border-2 border-purple-500 text-white p-6 rounded-lg flex items-center space-x-3 transition-colors"
            >
              <MessageSquare className="h-6 w-6" />
              <span className="font-semibold">Messages</span>
            </Link>

            <Link
              href="/dashboard/analytics"
              className="bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500 text-white p-6 rounded-lg flex items-center space-x-3 transition-colors"
            >
              <BarChart3 className="h-6 w-6" />
              <span className="font-semibold">View Analytics</span>
            </Link>
          </div>
        </div>

        {/* Streams List */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Your Streams</h2>
          {streams.length > 0 ? (
            <div className="space-y-4">
              {streams.map((stream) => (
                <div
                  key={stream.id}
                  className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-primary-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {stream.title}
                        </h3>
                        {stream.is_live && (
                          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center space-x-1">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            <span>LIVE</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{formatViewerCount(stream.viewer_count)} viewers</span>
                        {stream.category && <span>{stream.category}</span>}
                        <span>{timeAgo(stream.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/stream/${stream.id}`}
                        className="bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        View Stream
                      </Link>
                      {stream.is_live && (
                        <button
                          onClick={() => handleEndStream(stream.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          End Stream
                        </button>
                      )}
                      {!stream.is_live && (
                        <button
                          onClick={() => handleDeleteStream(stream.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2"
                          title="Delete this recording"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
              <Video className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No streams yet
              </h3>
              <p className="text-gray-400 mb-6">
                Create your first stream to get started
              </p>
              <Link
                href="/dashboard/stream/new"
                className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create Stream</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

