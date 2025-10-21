'use client'

import Link from 'next/link'
import { Stream, Profile } from '@/lib/supabase'
import { formatViewerCount, timeAgo } from '@/lib/utils'
import { Eye, Clock, Play, User, Verified } from 'lucide-react'

interface StreamCardProps {
  stream: Stream & {
    profiles?: Profile
  }
}

export default function StreamCard({ stream }: StreamCardProps) {
  return (
    <Link href={`/stream/${stream.id}`} className="group">
      <div className="stream-card card overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {stream.thumbnail_url ? (
            <img
              src={stream.thumbnail_url}
              alt={stream.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <div className="text-center">
                <Play className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No thumbnail</p>
              </div>
            </div>
          )}
          
          {/* Live Badge */}
          {stream.is_live && (
            <div className="absolute top-3 left-3">
              <div className="live-pulse bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>LIVE</span>
              </div>
            </div>
          )}
          
          {/* Viewer Count */}
          {stream.is_live && (
            <div className="absolute bottom-3 left-3">
              <div className="glass-effect text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{formatViewerCount(stream.viewer_count)}</span>
              </div>
            </div>
          )}
          
          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
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
              
              <div className="flex items-center space-x-1 mt-1">
                <p className="text-sm text-muted-foreground truncate">
                  {stream.profiles?.display_name || stream.profiles?.username || 'Unknown'}
                </p>
                {stream.profiles?.is_verified && (
                  <Verified className="w-4 h-4 text-primary" />
                )}
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