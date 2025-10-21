'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { supabase, Stream } from '@/lib/supabase'
import { Video, Plus, Settings, BarChart3, Users } from 'lucide-react'
import Link from 'next/link'
import { formatViewerCount, timeAgo } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [streams, setStreams] = useState<Stream[]>([])
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
      setLoading(false)
    }

    checkUser()
  }, [router])

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

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Creator Dashboard
          </h1>
          <p className="text-gray-400">
            Manage your streams and engage with your audience
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Total Streams</h3>
              <Video className="h-5 w-5 text-primary-500" />
            </div>
            <p className="text-3xl font-bold text-white">{streams.length}</p>
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
              <h3 className="text-gray-400 text-sm font-medium">Total Views</h3>
              <BarChart3 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white">
              {formatViewerCount(totalViews)}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/stream/new"
              className="bg-primary-600 hover:bg-primary-700 text-white p-6 rounded-lg flex items-center space-x-3 transition-colors"
            >
              <Plus className="h-6 w-6" />
              <span className="font-semibold">Create New Stream</span>
            </Link>
            
            <button className="bg-gray-900 hover:bg-gray-800 text-white p-6 rounded-lg flex items-center space-x-3 transition-colors border border-gray-800">
              <Settings className="h-6 w-6" />
              <span className="font-semibold">Stream Settings</span>
            </button>

            <button className="bg-gray-900 hover:bg-gray-800 text-white p-6 rounded-lg flex items-center space-x-3 transition-colors border border-gray-800">
              <BarChart3 className="h-6 w-6" />
              <span className="font-semibold">View Analytics</span>
            </button>
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
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        View Stream
                      </Link>
                      {stream.is_live && (
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                          End Stream
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

