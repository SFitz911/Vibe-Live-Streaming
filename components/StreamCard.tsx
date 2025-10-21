'use client'

import Link from 'next/link'
import { Stream, Profile } from '@/lib/supabase'
import { formatViewerCount, timeAgo } from '@/lib/utils'
import { Eye, Clock } from 'lucide-react'

interface StreamCardProps {
  stream: Stream & {
    profiles?: Profile
  }
}

export default function StreamCard({ stream }: StreamCardProps) {
  return (
    <Link href={`/stream/${stream.id}`}>
      <div className="group cursor-pointer bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all">
        <div className="relative aspect-video bg-gray-900">
          {stream.thumbnail_url ? (
            <img
              src={stream.thumbnail_url}
              alt={stream.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <Radio className="h-16 w-16" />
            </div>
          )}
          {stream.is_live && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center space-x-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span>LIVE</span>
            </div>
          )}
          {stream.is_live && (
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{formatViewerCount(stream.viewer_count)}</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                {stream.profiles?.display_name?.[0] || 'U'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                {stream.title}
              </h3>
              <p className="text-sm text-gray-400 truncate">
                {stream.profiles?.display_name || 'Unknown'}
              </p>
              {stream.category && (
                <p className="text-xs text-gray-500 mt-1">{stream.category}</p>
              )}
              {!stream.is_live && stream.created_at && (
                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{timeAgo(stream.created_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function Radio({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  )
}

