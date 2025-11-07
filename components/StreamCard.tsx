'use client'

import Link from 'next/link'
import { Stream, Profile } from '@/lib/supabase'
import { formatViewerCount, timeAgo } from '@/lib/utils'
import { Eye, Clock, Play, User, Verified } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import UserLevelBadge, { calculateUserLevel } from './UserLevelBadge'
import LikeButton from './LikeButton'

interface StreamCardProps {
  stream: Stream & {
    profiles?: Profile
  }
}

export default function StreamCard({ stream }: StreamCardProps) {
  const { user } = useAuth()
  const [streamerLevel, setStreamerLevel] = useState({ level: 1, totalPoints: 0 })
  const [likeCount, setLikeCount] = useState(0)
  
  // Check if stream is recently live (ended but still showing in Live Now)
  const isRecentlyLive = !stream.is_live && stream.recently_live_until && new Date(stream.recently_live_until) > new Date()

  useEffect(() => {
    // Fetch streamer's total stats to calculate level
    const fetchStreamerLevel = async () => {
      if (stream.user_id) {
        const { data } = await supabase
          .from('streams')
          .select('*')
          .eq('user_id', stream.user_id)

        if (data) {
          setStreamerLevel(calculateUserLevel(data))
        }
      }
    }

    fetchStreamerLevel()
  }, [stream.user_id])

  useEffect(() => {
    // Fetch initial like count
    const fetchLikeCount = async () => {
      const { count } = await supabase
        .from('stream_likes')
        .select('*', { count: 'exact', head: true })
        .eq('stream_id', stream.id)

      setLikeCount(count || 0)
    }

    fetchLikeCount()
  }, [stream.id])

  return (
    <Link href={`/stream/${stream.id}`} className="group">
      <div className="stream-card card overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {/* Thumbnail Display Logic */}
          {stream.thumbnail_url ? (
            // Check if it's a video thumbnail (.webm) or static image
            stream.thumbnail_url.endsWith('.webm') ? (
              // Video thumbnail - plays ONLY on hover, paused by default
              <video
                src={stream.thumbnail_url}
                loop
                muted
                playsInline
                preload="metadata"
                onMouseEnter={(e) => {
                  e.currentTarget.play().catch(err => console.log('Play prevented:', err))
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.pause()
                  e.currentTarget.currentTime = 0 // Reset to start
                }}
                style={{ pointerEvents: 'none' }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              // Static image thumbnail (YouTube or uploaded)
              <img
                src={stream.thumbnail_url}
                alt={stream.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )
          ) : stream.is_live ? (
            // Live stream without captured thumbnail yet - show placeholder
            <div className="w-full h-full flex items-center justify-center bg-black">
              <div className="text-center">
                <h2 className="text-2xl font-light text-white">Nextwork.org</h2>
                <p className="text-lg font-light text-gray-300 mt-1">Classroom</p>
              </div>
            </div>
          ) : (
            // No thumbnail available for recorded stream
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <div className="text-center">
                <Play className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No thumbnail</p>
              </div>
            </div>
          )}
          
          {/* Live Badge */}
          {stream.is_live ? (
            <div className="absolute top-3 left-3" style={{ pointerEvents: 'none' }}>
              <div className="live-pulse bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>LIVE</span>
              </div>
            </div>
          ) : isRecentlyLive ? (
            <div className="absolute top-3 left-3" style={{ pointerEvents: 'none' }}>
              <div className="bg-orange-500/90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span>RECENTLY LIVE</span>
              </div>
            </div>
          ) : (
            <div className="absolute top-3 left-3" style={{ pointerEvents: 'none' }}>
              <div className="glass-effect bg-gray-800/80 text-gray-200 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                <Play className="w-3 h-3" />
                <span>RECORDED</span>
              </div>
            </div>
          )}
          
          {/* Viewer Count */}
          {(stream.is_live || isRecentlyLive) && (
            <div className="absolute bottom-3 left-3" style={{ pointerEvents: 'none' }}>
              <div className="glass-effect text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{formatViewerCount(stream.viewer_count)}</span>
              </div>
            </div>
          )}
          
          {/* Play Overlay */}
          <div 
            className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center"
            style={{ pointerEvents: 'none' }}
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
          </div>

          {/* Like Button - Bottom Right Corner */}
          <div 
            className="absolute bottom-0 right-0 z-20" 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <LikeButton 
              streamId={stream.id} 
              userId={user?.id}
              initialLikeCount={likeCount}
              showInCorner={true}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {stream.profiles?.avatar_url ? (
                <img
                  src={stream.profiles.avatar_url}
                  alt={stream.profiles.display_name || stream.profiles.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {stream.profiles?.display_name?.[0] || stream.profiles?.username?.[0] || 'U'}
                </div>
              )}
            </div>
            
            {/* Stream Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {stream.title}
              </h3>
              
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-sm text-muted-foreground truncate">
                  {stream.profiles?.display_name || stream.profiles?.username || 'Unknown'}
                </p>
                {stream.profiles?.is_verified && (
                  <Verified className="w-4 h-4 text-primary flex-shrink-0" />
                )}
                <UserLevelBadge totalPoints={streamerLevel.totalPoints} size="small" />
              </div>
              
              {stream.category && (
                <div className="mt-2">
                  <span className="inline-block bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                    {stream.category}
                  </span>
                </div>
              )}
              
              {!stream.is_live && stream.created_at && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-2">
                  <Clock className="w-3 h-3" />
                  <span>{timeAgo(stream.created_at)} ago</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}