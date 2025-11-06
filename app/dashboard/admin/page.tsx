'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import BackButton from '@/components/BackButton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Users, Award, ThumbsUp, Video, TrendingUp, CheckCircle, Search, X } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Stats
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalStreams, setTotalStreams] = useState(0)
  const [totalLikes, setTotalLikes] = useState(0)
  const [totalProjectCompletions, setTotalProjectCompletions] = useState(0)
  
  // Projects
  const [projects, setProjects] = useState<any[]>([])
  
  // User search and project marking
  const [searchEmail, setSearchEmail] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedProject, setSelectedProject] = useState('')
  const [completionNotes, setCompletionNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  
  // Recent activity
  const [recentCompletions, setRecentCompletions] = useState<any[]>([])
  const [topStreamers, setTopStreamers] = useState<any[]>([])
  const [mostLikedStreams, setMostLikedStreams] = useState<any[]>([])

  useEffect(() => {
    checkAdminAccess()
  }, [user, profile])

  const checkAdminAccess = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Demo mode - everyone has admin access
    setIsAdmin(true)
    await fetchAllData()
    setLoading(false)
  }

  const fetchAllData = async () => {
    // Fetch stats
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    setTotalUsers(userCount || 0)

    const { count: streamCount } = await supabase
      .from('streams')
      .select('*', { count: 'exact', head: true })
    setTotalStreams(streamCount || 0)

    const { count: likeCount } = await supabase
      .from('stream_likes')
      .select('*', { count: 'exact', head: true })
    setTotalLikes(likeCount || 0)

    const { count: completionCount } = await supabase
      .from('user_project_completions')
      .select('*', { count: 'exact', head: true })
    setTotalProjectCompletions(completionCount || 0)

    // Fetch projects
    const { data: projectsData } = await supabase
      .from('nextwork_projects')
      .select('*')
      .eq('is_active', true)
      .order('title')
    setProjects(projectsData || [])

    // Fetch recent completions
    const { data: completionsData } = await supabase
      .from('user_project_completions')
      .select(`
        *,
        profiles!user_id (username, display_name),
        nextwork_projects (title)
      `)
      .order('completed_at', { ascending: false })
      .limit(10)
    setRecentCompletions(completionsData || [])

    // Fetch top streamers
    const { data: usersData } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        streams (id, viewer_count)
      `)
      .limit(10)
    
    if (usersData) {
      const streamersWithStats = usersData.map((u: any) => ({
        ...u,
        totalStreams: u.streams?.length || 0,
        totalViews: u.streams?.reduce((acc: number, s: any) => acc + (s.viewer_count || 0), 0) || 0
      }))
      .filter((u: any) => u.totalStreams > 0)
      .sort((a: any, b: any) => b.totalViews - a.totalViews)
      .slice(0, 10)
      
      setTopStreamers(streamersWithStats)
    }

    // Fetch most liked streams
    const { data: streamsData } = await supabase
      .from('streams')
      .select(`
        id,
        title,
        user_id,
        profiles (username, display_name)
      `)

    if (streamsData) {
      const streamsWithLikes = await Promise.all(
        streamsData.map(async (stream: any) => {
          const { count } = await supabase
            .from('stream_likes')
            .select('*', { count: 'exact', head: true })
            .eq('stream_id', stream.id)
          
          return {
            ...stream,
            likeCount: count || 0
          }
        })
      )

      const sorted = streamsWithLikes
        .filter((s: any) => s.likeCount > 0)
        .sort((a: any, b: any) => b.likeCount - a.likeCount)
        .slice(0, 10)
      
      setMostLikedStreams(sorted)
    }
  }

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) return

    const { data: userData } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', searchEmail.toLowerCase().trim())
      .single()

    if (!userData) {
      // Try searching profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          streams (id),
          user_project_completions (
            id,
            nextwork_projects (title)
          )
        `)
        .or(`username.ilike.%${searchEmail}%,display_name.ilike.%${searchEmail}%`)
        .limit(1)
        .single()

      if (profileData) {
        setSelectedUser(profileData)
      } else {
        alert('User not found. Try searching by exact email address.')
      }
    } else {
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          *,
          streams (id),
          user_project_completions (
            id,
            nextwork_projects (title)
          )
        `)
        .eq('id', userData.id)
        .single()

      setSelectedUser(profileData)
    }
  }

  const handleMarkProjectComplete = async () => {
    if (!selectedUser || !selectedProject) {
      alert('Please select a user and project')
      return
    }

    setActionLoading(true)

    try {
      const { error } = await supabase
        .from('user_project_completions')
        .insert({
          user_id: selectedUser.id,
          project_id: selectedProject,
          verified_by: user?.id,
          notes: completionNotes,
        })

      if (error) {
        if (error.code === '23505') {
          alert('This user has already completed this project!')
        } else {
          throw error
        }
      } else {
        alert('✅ Project marked as complete! User earned +20 XP!')
        setCompletionNotes('')
        setSelectedProject('')
        await fetchAllData()
        // Refresh selected user data
        handleSearchUser()
      }
    } catch (error) {
      console.error('Error marking completion:', error)
      alert('Failed to mark project complete')
    } finally {
      setActionLoading(false)
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

  if (!isAdmin) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackButton href="/dashboard" label="Back to Dashboard" />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎓 Nextwork.org Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Manage users, projects, and track platform analytics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-white">{totalUsers}</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Total Streams</h3>
              <Video className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-white">{totalStreams}</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Total Likes</h3>
              <ThumbsUp className="h-5 w-5 text-pink-500" />
            </div>
            <p className="text-3xl font-bold text-white">{totalLikes}</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Projects Completed</h3>
              <Award className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-white">{totalProjectCompletions}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Mark Project Complete */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Award className="h-6 w-6 mr-2 text-yellow-500" />
              Mark Project Complete
            </h2>

            {/* User Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search User (Email or Username)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                  placeholder="user@example.com or username"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearchUser}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500 text-white rounded-lg transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Selected User Info */}
            {selectedUser && (
              <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold">{selectedUser.display_name || selectedUser.username}</p>
                    <p className="text-gray-400 text-sm">@{selectedUser.username}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {selectedUser.streams?.length || 0} streams • {selectedUser.user_project_completions?.length || 0} projects completed
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {selectedUser.user_project_completions && selectedUser.user_project_completions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">Completed Projects:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.user_project_completions.map((comp: any, idx: number) => (
                        <span key={idx} className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          ✓ {comp.nextwork_projects?.title || 'Project'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Project Selection */}
            {selectedUser && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Project
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a project...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title} (+{project.xp_reward} XP)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Add any notes about this completion..."
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleMarkProjectComplete}
                  disabled={!selectedProject || actionLoading}
                  className="w-full px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>{actionLoading ? 'Processing...' : 'Mark Complete (+20 XP)'}</span>
                </button>
              </>
            )}
          </div>

          {/* Recent Project Completions */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-green-500" />
              Recent Project Completions
            </h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {recentCompletions.length === 0 ? (
                <p className="text-gray-500 text-sm">No completions yet</p>
              ) : (
                recentCompletions.map((completion) => (
                  <div key={completion.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">
                          {completion.profiles?.display_name || completion.profiles?.username}
                        </p>
                        <p className="text-blue-400 text-xs mt-1">
                          {completion.nextwork_projects?.title}
                        </p>
                        {completion.notes && (
                          <p className="text-gray-500 text-xs mt-1 italic">{completion.notes}</p>
                        )}
                      </div>
                      <span className="text-green-400 text-xs font-semibold">+20 XP</span>
                    </div>
                    <p className="text-gray-600 text-xs mt-2">
                      {new Date(completion.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Streamers */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Users className="h-6 w-6 mr-2 text-purple-500" />
              Top Streamers by Views
            </h2>

            <div className="space-y-3">
              {topStreamers.length === 0 ? (
                <p className="text-gray-500 text-sm">No streams yet</p>
              ) : (
                topStreamers.map((streamer, idx) => (
                  <div key={streamer.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-gray-600">#{idx + 1}</span>
                      <div>
                        <p className="text-white font-medium">{streamer.display_name || streamer.username}</p>
                        <p className="text-gray-400 text-xs">@{streamer.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{streamer.totalViews.toLocaleString()}</p>
                      <p className="text-gray-500 text-xs">{streamer.totalStreams} streams</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Most Liked Streams */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <ThumbsUp className="h-6 w-6 mr-2 text-pink-500" />
              Most Liked Streams
            </h2>

            <div className="space-y-3">
              {mostLikedStreams.length === 0 ? (
                <p className="text-gray-500 text-sm">No likes yet</p>
              ) : (
                mostLikedStreams.map((stream, idx) => (
                  <div key={stream.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-gray-600">#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{stream.title}</p>
                        <p className="text-gray-400 text-xs">by @{stream.profiles?.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="h-4 w-4 text-pink-400 fill-current" />
                      <span className="text-white font-semibold">{stream.likeCount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* All Projects List */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">
            📚 All Nextwork Projects
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-white font-semibold text-sm mb-1">{project.title}</h3>
                <p className="text-gray-400 text-xs mb-2">{project.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{project.difficulty}</span>
                  <span className="text-xs font-semibold text-yellow-400">+{project.xp_reward} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

