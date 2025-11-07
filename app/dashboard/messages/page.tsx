'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import BackButton from '@/components/BackButton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { MessageSquare, Send, Search, User } from 'lucide-react'

interface DirectMessage {
  id: string
  sender_id: string
  recipient_id: string
  message: string
  is_read: boolean
  created_at: string
  sender?: {
    id: string
    username: string
    display_name: string
    avatar_url: string
  }
  recipient?: {
    id: string
    username: string
    display_name: string
    avatar_url: string
  }
}

export default function MessagesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Map<string, DirectMessage[]>>(new Map())
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    fetchUsers()
    fetchAllConversations()
    subscribeToMessages()
    
    setLoading(false)
  }, [user, router])

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom()
  }, [selectedUser, conversations])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchUsers = async () => {
    // Fetch all users except current user
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .neq('id', user!.id)
      .order('username')
    
    setAllUsers(data || [])
  }

  const fetchAllConversations = async () => {
    if (!user) return

    // Fetch all messages for current user
    const { data: messages } = await supabase
      .from('direct_messages')
      .select(`
        *,
        sender:profiles!sender_id (id, username, display_name, avatar_url),
        recipient:profiles!recipient_id (id, username, display_name, avatar_url)
      `)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: true })

    if (messages) {
      // Group messages by conversation partner
      const convMap = new Map<string, DirectMessage[]>()
      
      messages.forEach((msg: any) => {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, [])
        }
        convMap.get(partnerId)!.push(msg)
      })
      
      setConversations(convMap)
    }
  }

  const subscribeToMessages = () => {
    if (!user) return

    const channel = supabase
      .channel('direct-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New message received!', payload)
          fetchAllConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !user) return

    setSending(true)

    try {
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedUser.id,
          message: newMessage.trim(),
        })

      if (error) throw error

      setNewMessage('')
      await fetchAllConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const markAsRead = async (partnerId: string) => {
    if (!user) return

    // Mark all messages from this partner as read
    await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('sender_id', partnerId)
      .eq('recipient_id', user.id)
      .eq('is_read', false)
  }

  const handleSelectUser = async (userId: string) => {
    const userObj = allUsers.find(u => u.id === userId)
    setSelectedUser(userObj)
    setSearchTerm(userObj?.display_name || userObj?.username || '')
    
    // Mark messages as read
    await markAsRead(userId)
    await fetchAllConversations()
  }

  // Filter users based on search
  const filteredUsers = allUsers.filter(u => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      u.username?.toLowerCase().includes(term) ||
      u.display_name?.toLowerCase().includes(term)
    )
  })

  // Get current conversation
  const currentMessages = selectedUser ? conversations.get(selectedUser.id) || [] : []

  // Get users with messages (for quick access)
  const usersWithMessages = Array.from(conversations.keys())
    .map(userId => allUsers.find(u => u.id === userId))
    .filter(u => u != null)

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

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackButton href="/dashboard" label="Back to Dashboard" />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <MessageSquare className="mr-3" />
            Messages
          </h1>
          <p className="text-gray-400">
            Private conversations with your students and colleagues
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Select User</h3>
              
              {/* Search Input */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>

              {/* Recent Conversations */}
              {usersWithMessages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 uppercase">Recent Conversations</p>
                  <div className="space-y-1">
                    {usersWithMessages.slice(0, 5).map((u: any) => {
                      const unreadCount = conversations.get(u.id)?.filter(
                        m => m.sender_id === u.id && !m.is_read
                      ).length || 0

                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSelectUser(u.id)}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            selectedUser?.id === u.id
                              ? 'bg-purple-600'
                              : 'bg-gray-800 hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                {u.display_name?.[0] || u.username?.[0]}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {u.display_name || u.username}
                              </p>
                              {unreadCount > 0 && (
                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                  {unreadCount} new
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* All Users List */}
              <p className="text-xs text-gray-500 mb-2 uppercase">All Users</p>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedUser?.id === u.id
                        ? 'bg-purple-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {u.display_name?.[0] || u.username?.[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {u.display_name || u.username}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          @{u.username}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl border border-gray-800 h-[600px] flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                      {selectedUser.avatar_url ? (
                        <img src={selectedUser.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                          {selectedUser.display_name?.[0] || selectedUser.username?.[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold">
                          {selectedUser.display_name || selectedUser.username}
                        </p>
                        <p className="text-gray-400 text-sm">
                          @{selectedUser.username}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {currentMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-500">No messages yet</p>
                          <p className="text-gray-600 text-sm">Send a message to start the conversation</p>
                        </div>
                      </div>
                    ) : (
                      currentMessages.map((msg) => {
                        const isMe = msg.sender_id === user?.id
                        
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  isMe
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-800 text-white'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 px-2">
                                {new Date(msg.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-800">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Select a user to start messaging</p>
                    <p className="text-gray-600 text-sm mt-2">
                      Choose from the list or search for someone
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

