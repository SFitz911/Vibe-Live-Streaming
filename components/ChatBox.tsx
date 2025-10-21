'use client'

import { useState, useEffect, useRef } from 'react'
// import { supabase, ChatMessage, Profile } from '@/lib/supabase'
import { Send } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

interface ChatBoxProps {
  streamId: string
  userId?: string
}

interface ChatMessageWithProfile {
  id: string
  stream_id: string
  user_id: string
  message: string
  created_at: string
  is_moderator?: boolean
  profiles?: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
    is_verified: boolean
  }
}

export default function ChatBox({ streamId, userId }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessageWithProfile[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Temporarily disabled for deployment
  // useEffect(() => {
  //   // Fetch initial messages
  //   const fetchMessages = async () => {
  //     const { data, error } = await supabase
  //       .from('chat_messages')
  //       .select(`
  //         *,
  //         profiles:user_id (
  //           username,
  //           display_name,
  //           avatar_url,
  //           is_verified
  //         )
  //       `)
  //       .eq('stream_id', streamId)
  //       .order('created_at', { ascending: true })
  //       .limit(100)

  //     if (data && !error) {
  //       setMessages(data as ChatMessageWithProfile[])
  //     }
  //   }

  //   fetchMessages()

  //   // Subscribe to new messages
  //   const channel = supabase
  //     .channel(`chat:${streamId}`)
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: 'INSERT',
  //         schema: 'public',
  //         table: 'chat_messages',
  //         filter: `stream_id=eq.${streamId}`,
  //       },
  //       async (payload) => {
  //         // Fetch the profile data for the new message
  //         const { data: profile } = await supabase
  //           .from('profiles')
  //           .select('username, display_name, avatar_url, is_verified')
  //           .eq('id', payload.new.user_id)
  //           .single()

  //         const messageWithProfile = {
  //           ...payload.new,
  //           profiles: profile,
  //         } as ChatMessageWithProfile

  //         setMessages((prev) => [...prev, messageWithProfile])
  //       }
  //     )
  //     .subscribe()

  //   return () => {
  //     supabase.removeChannel(channel)
  //   }
  // }, [streamId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !userId || isLoading) return

    setIsLoading(true)

    try {
      // Temporarily disabled for deployment
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     streamId,
      //     userId,
      //     message: newMessage.trim(),
      //   }),
      // })

      // if (response.ok) {
      //   setNewMessage('')
      // }
      
      // For now, just clear the message
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
              {message.profiles?.display_name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-white">
                  {message.profiles?.display_name || 'Anonymous'}
                </span>
                {message.profiles?.is_verified && (
                  <span className="text-primary-400">✓</span>
                )}
                {message.is_moderator && (
                  <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">
                    MOD
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {timeAgo(message.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-300 break-words">
                {message.message}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={userId ? 'Send a message...' : 'Sign in to chat'}
            disabled={!userId || isLoading}
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!userId || !newMessage.trim() || isLoading}
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}

