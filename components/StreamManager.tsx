'use client'

import { useState, useEffect } from 'react'
import { Play, Square, Users, Eye, Settings, ExternalLink } from 'lucide-react'

interface StreamManagerProps {
  streamId: string
  streamKey?: string
  rtmpUrl?: string
}

export default function StreamManager({ streamId, streamKey, rtmpUrl }: StreamManagerProps) {
  const [isLive, setIsLive] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [streamDuration, setStreamDuration] = useState(0)

  // Simulate stream status checking
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would check the actual stream status
      // For now, we'll simulate it
      setViewerCount(Math.floor(Math.random() * 50) + 10)
      
      if (isLive) {
        setStreamDuration(prev => prev + 1)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isLive])

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartStream = () => {
    setIsLive(true)
    setStreamDuration(0)
    // In a real app, this would trigger the actual stream start
  }

  const handleStopStream = () => {
    setIsLive(false)
    setStreamDuration(0)
    // In a real app, this would trigger the actual stream stop
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Stream Manager</h3>
        <div className="flex items-center space-x-2">
          {isLive ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-500 font-semibold">LIVE</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-gray-500 font-semibold">OFFLINE</span>
            </div>
          )}
        </div>
      </div>

      {/* Stream Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-300">Viewers</span>
          </div>
          <p className="text-2xl font-bold text-white">{viewerCount}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-300">Duration</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatDuration(streamDuration)}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Settings className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-300">Status</span>
          </div>
          <p className="text-2xl font-bold text-white">{isLive ? 'Live' : 'Ready'}</p>
        </div>
      </div>

      {/* Stream Configuration */}
      {streamKey && rtmpUrl && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Stream Configuration</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                RTMP Server
              </label>
              <input
                type="text"
                value={rtmpUrl}
                readOnly
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Stream Key
              </label>
              <input
                type="password"
                value={streamKey}
                readOnly
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stream Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {!isLive ? (
          <button
            onClick={handleStartStream}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <Play className="h-5 w-5" />
            <span>Start Stream</span>
          </button>
        ) : (
          <button
            onClick={handleStopStream}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <Square className="h-5 w-5" />
            <span>Stop Stream</span>
          </button>
        )}
        
        <a
          href="/dashboard/stream/setup"
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
        >
          <ExternalLink className="h-5 w-5" />
          <span>Stream Setup</span>
        </a>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="text-blue-400 font-semibold mb-2">How to stream:</h4>
        <ol className="text-sm text-gray-300 space-y-1">
          <li>1. Download and configure OBS Studio</li>
          <li>2. Use the RTMP Server and Stream Key above</li>
          <li>3. Click "Start Stream" when ready to go live</li>
          <li>4. Your stream will appear on the platform you chose</li>
        </ol>
      </div>
    </div>
  )
}
