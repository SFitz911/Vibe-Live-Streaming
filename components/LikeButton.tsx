'use client'

import { useState, useEffect } from 'react'
import { ThumbsUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface LikeButtonProps {
  streamId: string
  userId?: string
  initialLikeCount?: number
  showInCorner?: boolean
}

export default function LikeButton({ 
  streamId, 
  userId, 
  initialLikeCount = 0,
  showInCorner = true 
}: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLikeStatus()
    fetchLikeCount()
  }, [streamId, userId])

  const fetchLikeCount = async () => {
    const { count } = await supabase
      .from('stream_likes')
      .select('*', { count: 'exact', head: true })
      .eq('stream_id', streamId)

    setLikeCount(count || 0)
  }

  const fetchLikeStatus = async () => {
    if (!userId) return

    const { data } = await supabase
      .from('stream_likes')
      .select('id')
      .eq('stream_id', streamId)
      .eq('user_id', userId)
      .single()

    setIsLiked(!!data)
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      alert('Please sign in to like streams!')
      return
    }

    setLoading(true)

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('stream_likes')
          .delete()
          .eq('stream_id', streamId)
          .eq('user_id', userId)

        if (!error) {
          setIsLiked(false)
          setLikeCount(prev => prev - 1)
        }
      } else {
        // Like
        const { error } = await supabase
          .from('stream_likes')
          .insert({
            stream_id: streamId,
            user_id: userId,
          })

        if (!error) {
          setIsLiked(true)
          setLikeCount(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLoading(false)
    }
  }

  if (showInCorner) {
    // Bottom-right corner style for thumbnails
    return (
      <button
        onClick={handleLike}
        disabled={loading}
        className={`
          absolute bottom-2 right-2 z-10
          flex items-center space-x-1.5
          px-3 py-1.5 rounded-lg
          backdrop-blur-md
          transition-all duration-200
          ${isLiked 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' 
            : 'bg-black/60 text-white hover:bg-black/80'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        `}
      >
        <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        <span className="text-sm font-semibold">{likeCount}</span>
      </button>
    )
  }

  // Inline style for use in other contexts
  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`
        inline-flex items-center space-x-2 px-4 py-2 rounded-lg
        transition-colors duration-200
        ${isLiked 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
      <span className="font-medium">{likeCount} Likes</span>
    </button>
  )
}

