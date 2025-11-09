'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import BackButton from '@/components/BackButton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Users, Award, ThumbsUp, Video, TrendingUp, CheckCircle, Search, X, Settings, Shield } from 'lucide-react'
import Link from 'next/link'

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
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.user-search-container')) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    // Fetch all users for autocomplete
    console.log('🔍 Fetching users from profiles table...')
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')  // Fetch all columns to avoid missing column errors
      .order('username', { ascending: true, nullsFirst: false })
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      alert(`Error loading users: ${usersError.message}`)
    } else {
      console.log('✅ Fetched users successfully:', usersData?.length || 0, 'users')
      console.log('👤 Sample user:', usersData?.[0])
      setAllUsers(usersData || [])
    }

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
    const { data: streamersData } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        streams (id, viewer_count)
      `)
      .limit(10)
    
    if (streamersData) {
      const streamersWithStats = streamersData.map((u: any) => ({
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

  // Filter users based on search input
  const filteredUsers = allUsers.filter(u => {
    const searchTerm = searchEmail.toLowerCase().trim()
    if (!searchTerm) return true // Show all if empty
    
    return (
      u.username?.toLowerCase().includes(searchTerm) ||
      u.display_name?.toLowerCase().includes(searchTerm) ||
      u.email?.toLowerCase().includes(searchTerm)
    )
  }) // Show all filtered results

  const handleSelectUser = async (userId: string) => {
    // Fetch full user data with related records
    const { data: profileData, error: searchError } = await supabase
      .from('profiles')
      .select(`
        *,
        streams (id),
        user_project_completions (
          id,
          nextwork_projects (title)
        )
      `)
      .eq('id', userId)
      .single()

    if (searchError || !profileData) {
      alert('Error loading user data')
      console.error('Search error:', searchError)
      return
    }

    setSelectedUser(profileData)
    setSearchEmail('') // Clear search so dropdown can show all users next time
    setShowDropdown(false)
  }

  const handleMarkProjectComplete = async () => {
    if (!selectedUser || !selectedProject) {
      alert('Please select a user and project')
      return
    }

    console.log('Marking project complete:', {
      user_id: selectedUser.id,
      project_id: selectedProject,
      verified_by: user?.id
    })

    setActionLoading(true)

    try {
      const { data, error } = await supabase
        .from('user_project_completions')
        .insert({
          user_id: selectedUser.id,
          project_id: selectedProject,
          verified_by: user?.id,
          notes: completionNotes || null,
        })
        .select()

      console.log('Insert result:', { data, error })

      if (error) {
        if (error.code === '23505') {
          alert('This user has already completed this project!')
        } else if (error.code === '23503') {
          // Foreign key violation
          alert(`Database error: ${error.message}\n\nMake sure user profile exists and project is valid.`)
        } else {
          throw error
        }
      } else {
        alert('✅ Project marked as complete! User earned +20 XP!')
        setCompletionNotes('')
        setSelectedProject('')
        await fetchAllData()
        // Refresh selected user data
        if (selectedUser) {
          await handleSelectUser(selectedUser.id)
        }
      }
    } catch (error: any) {
      console.error('Error marking completion:', error)
      const errorMsg = error?.message || error?.details || error?.hint || 'Unknown error'
      alert(`Failed to mark project complete:\n\n${errorMsg}`)
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

        {/* Centered Header with Admin Badge */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-3">
            <Shield className="h-8 w-8 text-yellow-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-400 text-lg mb-4">
            Manage users, projects, and track platform analytics
          </p>
          
          {/* App Settings Button */}
          <div className="flex justify-center">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
            >
              <Settings className="h-5 w-5" />
              <span>App Settings</span>
            </Link>
          </div>
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

            {/* User Search and Selection */}
            <div className="mb-4 user-search-container relative">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Select Learner {allUsers.length > 0 && <span className="text-gray-500 text-xs">({allUsers.length} loaded)</span>}
                </label>
                <button
                  onClick={async () => {
                    console.log('Refreshing users list...')
                    await fetchAllData()
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  🔄 Refresh List
                </button>
              </div>
              
              {/* Search Input with Clear Button */}
              <div className="relative">
                <input
                  type="text"
                  value={searchEmail}
                  onChange={(e) => {
                    setSearchEmail(e.target.value)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder={`Search ${allUsers.length} learners by username, name, or email...`}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className="w-full px-4 py-3 pr-20 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
                {searchEmail && (
                  <button
                    onClick={() => {
                      setSearchEmail('')
                      setSelectedUser(null)
                      setShowDropdown(true)
                    }}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>

              {/* Dropdown Results */}
              {showDropdown && (
                <div className="absolute z-50 mt-2 w-full bg-gray-800 border-2 border-yellow-500 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
                  {filteredUsers.length === 0 && searchEmail.trim() !== '' ? (
                    /* Only show "no matches" when user is actively searching */
                    <div className="p-6 text-center text-gray-500">
                      <Search className="h-16 w-16 mx-auto mb-3 text-gray-600" />
                      <p className="text-lg font-semibold mb-1">No matches found</p>
                      <p className="text-sm">No users match "{searchEmail}"</p>
                      <button
                        onClick={() => {
                          setSearchEmail('')
                          setShowDropdown(true)
                        }}
                        className="mt-3 text-yellow-400 hover:text-yellow-300 text-sm underline"
                      >
                        Clear search and show all users
                      </button>
                    </div>
                  ) : allUsers.length === 0 ? (
                    /* Only show "no users in database" when truly empty */
                    <div className="p-6 text-center text-gray-500">
                      <Users className="h-16 w-16 mx-auto mb-3 text-gray-600" />
                      <p className="text-lg font-semibold mb-1">No users found in database</p>
                      <p className="text-sm">Stats show {totalUsers} users but profiles query failed. Check console for errors.</p>
                    </div>
                  ) : (
                    <>
                      <div className="sticky top-0 bg-gray-700 px-4 py-2 text-xs text-gray-400 border-b border-gray-600">
                        Showing {filteredUsers.length} of {allUsers.length} learners
                      </div>
                      <div className="py-1">
                        {filteredUsers.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => handleSelectUser(u.id)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center space-x-3 border-b border-gray-700/50 last:border-b-0"
                          >
                            {u.avatar_url ? (
                              <img 
                                src={u.avatar_url} 
                                alt="" 
                                className="w-10 h-10 rounded-full flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {(u.display_name?.[0] || u.username?.[0] || '?').toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">
                                {u.display_name || u.username}
                              </p>
                              <p className="text-gray-400 text-sm truncate">
                                @{u.username}
                              </p>
                              {u.email && (
                                <p className="text-gray-500 text-xs truncate">
                                  {u.email}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
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

