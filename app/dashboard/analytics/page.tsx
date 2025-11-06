'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import BackButton from '@/components/BackButton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { 
  BarChart3, TrendingUp, Eye, Clock, Calendar, Award,
  Users, Video, Star, Zap, Target, Trophy, Settings
} from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    fetchAnalytics()
  }, [user, selectedPeriod])

  const fetchAnalytics = async () => {
    if (!user) return

    try {
      // Get all user's streams
      const { data: streams, error } = await supabase
        .from('streams')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      // Calculate date filter
      let dateFilter = new Date()
      if (selectedPeriod === 'week') {
        dateFilter.setDate(dateFilter.getDate() - 7)
      } else if (selectedPeriod === 'month') {
        dateFilter.setMonth(dateFilter.getMonth() - 1)
      } else {
        dateFilter = new Date('2000-01-01') // All time
      }

      const filteredStreams = streams?.filter(s => 
        new Date(s.created_at) >= dateFilter
      ) || []

      // Calculate stats
      const totalStreams = filteredStreams.length
      const liveStreams = filteredStreams.filter(s => s.is_live).length
      const recordedStreams = filteredStreams.filter(s => !s.is_live && s.playback_url).length
      const totalViews = filteredStreams.reduce((sum, s) => sum + (s.viewer_count || 0), 0)
      const avgViewers = totalStreams > 0 ? Math.round(totalViews / totalStreams) : 0
      
      // Calculate total stream time (if ended_at exists)
      const totalMinutes = filteredStreams.reduce((sum, s) => {
        if (s.started_at && s.ended_at) {
          const duration = new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()
          return sum + (duration / 1000 / 60) // Convert to minutes
        }
        return sum
      }, 0)

      // Get most popular stream
      const mostViewed = streams?.sort((a, b) => b.viewer_count - a.viewer_count)[0]

      // Category breakdown
      const categoryStats: any = {}
      streams?.forEach(s => {
        if (s.category) {
          categoryStats[s.category] = (categoryStats[s.category] || 0) + 1
        }
      })

      setStats({
        totalStreams,
        liveStreams,
        recordedStreams,
        totalViews,
        avgViewers,
        totalMinutes: Math.round(totalMinutes),
        totalHours: (totalMinutes / 60).toFixed(1),
        mostViewed,
        categoryStats,
        allTimeStreams: streams?.length || 0,
        allTimeViews: streams?.reduce((sum, s) => sum + (s.viewer_count || 0), 0) || 0,
      })

      setLoading(false)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </main>
    )
  }

  // Calculate user level and points
  const totalPoints = (stats?.allTimeViews || 0) + (stats?.allTimeStreams || 0) * 10
  const level = Math.min(Math.floor(totalPoints / 100) + 1, 9)
  const pointsToNextLevel = (level * 100) - totalPoints
  const levelProgress = ((totalPoints % 100) / 100) * 100

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackButton href="/dashboard" label="Back to Dashboard" />
        </div>
        
        {/* Header with Level Badge */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Stream Analytics
            </h1>
            <p className="text-gray-400">
              Track your performance and growth
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/admin"
              className="bg-yellow-500/20 hover:bg-yellow-500/30 border-2 border-yellow-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 text-sm"
            >
              <Shield className="h-4 w-4" />
              <span>Admin</span>
            </Link>
            
            {/* User Level Badge */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-center min-w-[200px]">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="text-yellow-400 mr-2" size={24} />
                <span className="text-white text-sm font-medium">LEVEL</span>
              </div>
              <div className="text-6xl font-bold text-white mb-2">{level}</div>
              <div className="text-yellow-400 text-sm font-semibold mb-3">{totalPoints} XP</div>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
              <p className="text-xs text-white/80">
                {level === 9 ? '🌟 MAX LEVEL!' : `${pointsToNextLevel} XP to Level ${level + 1}`}
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setSelectedPeriod('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-400 text-sm font-medium">Total Streams</h3>
              <Video className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats?.totalStreams || 0}</p>
            <p className="text-xs text-gray-500">
              {stats?.recordedStreams || 0} with recordings
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-400 text-sm font-medium">Total Views</h3>
              <Eye className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats?.totalViews || 0}</p>
            <p className="text-xs text-gray-500">
              Avg {stats?.avgViewers || 0} per stream
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-400 text-sm font-medium">Stream Time</h3>
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats?.totalHours || 0}</p>
            <p className="text-xs text-gray-500">
              {stats?.totalMinutes || 0} minutes total
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-400 text-sm font-medium">Currently Live</h3>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats?.liveStreams || 0}</p>
            <p className="text-xs text-gray-500">
              Active broadcasts
            </p>
          </div>
        </div>

        {/* Level Progress and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* XP Breakdown */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Zap className="text-yellow-400 mr-2" size={24} />
              Experience Points
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <Video className="text-blue-400 mr-3" size={20} />
                  <span className="text-gray-300">Streams Created</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{stats?.allTimeStreams || 0} × 10</p>
                  <p className="text-xs text-gray-500">{(stats?.allTimeStreams || 0) * 10} XP</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <Eye className="text-green-400 mr-3" size={20} />
                  <span className="text-gray-300">Total Views</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{stats?.allTimeViews || 0} × 1</p>
                  <p className="text-xs text-gray-500">{stats?.allTimeViews || 0} XP</p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Total XP Earned</span>
                  <span className="text-2xl font-bold text-yellow-400">{totalPoints}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Level Milestones */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Target className="text-purple-400 mr-2" size={24} />
              Level Milestones
            </h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
                const xpRequired = (lvl - 1) * 100
                const isUnlocked = totalPoints >= xpRequired
                const isCurrent = lvl === level
                
                return (
                  <div 
                    key={lvl}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isCurrent ? 'bg-gradient-to-r from-purple-600 to-blue-600' :
                      isUnlocked ? 'bg-gray-800' : 'bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        isCurrent ? 'bg-yellow-400 text-gray-900' :
                        isUnlocked ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-700 text-gray-500'
                      }`}>
                        {isUnlocked ? (
                          <Star className="fill-current" size={20} />
                        ) : (
                          <span className="font-bold">{lvl}</span>
                        )}
                      </div>
                      <div>
                        <p className={`font-bold ${isCurrent ? 'text-white' : isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                          Level {lvl} {getLevelTitle(lvl)}
                        </p>
                        <p className={`text-xs ${isCurrent ? 'text-white/80' : 'text-gray-500'}`}>
                          {xpRequired} XP required
                        </p>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                        CURRENT
                      </span>
                    )}
                    {isUnlocked && !isCurrent && (
                      <span className="text-green-400 text-xs font-semibold">✓ Unlocked</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <BarChart3 className="text-blue-400 mr-2" size={24} />
            Streams by Category
          </h3>
          {stats?.categoryStats && Object.keys(stats.categoryStats).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(stats.categoryStats).map(([category, count]: [string, any]) => (
                <div key={category} className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-white mb-1">{count}</p>
                  <p className="text-sm text-gray-400">{category}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No category data yet</p>
          )}
        </div>

        {/* Most Popular Stream */}
        {stats?.mostViewed && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Trophy className="text-yellow-400 mr-2" size={24} />
              Most Popular Stream
            </h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-white">{stats.mostViewed.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{stats.mostViewed.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-400">{stats.mostViewed.viewer_count}</p>
                  <p className="text-xs text-gray-500">viewers</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/stream/demo-live"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl flex items-center space-x-3 transition-colors"
          >
            <Video className="h-6 w-6" />
            <span className="font-semibold">Go Live Now</span>
          </Link>
          
          <Link
            href="/dashboard"
            className="bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl flex items-center space-x-3 transition-colors border border-gray-700"
          >
            <BarChart3 className="h-6 w-6" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>

          <Link
            href="/discover"
            className="bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl flex items-center space-x-3 transition-colors border border-gray-700"
          >
            <TrendingUp className="h-6 w-6" />
            <span className="font-semibold">Browse Streams</span>
          </Link>
        </div>
      </div>
    </main>
  )
}

// Helper function to get level titles
function getLevelTitle(level: number): string {
  const titles = [
    '', // Level 0 (not used)
    'Beginner', // Level 1
    'Novice', // Level 2
    'Apprentice', // Level 3
    'Intermediate', // Level 4
    'Advanced', // Level 5
    'Expert', // Level 6
    'Master', // Level 7
    'Guru', // Level 8
    'Legend', // Level 9
  ]
  return titles[level] || ''
}

