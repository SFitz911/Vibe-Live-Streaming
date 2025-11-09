'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'

interface LiveStreamNotificationProps {
  isEnabled?: boolean
}

export default function LiveStreamNotification({ isEnabled = true }: LiveStreamNotificationProps) {
  const [notification, setNotification] = useState<{
    show: boolean
    streamTitle: string
    streamId: string
  } | null>(null)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setHasPermission(permission === 'granted')
      })
    } else if ('Notification' in window && Notification.permission === 'granted') {
      setHasPermission(true)
    }
  }, [])

  useEffect(() => {
    if (!isEnabled) return

    // Check for new live streams every 2 minutes (reduced frequency)
    const checkForLiveStreams = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate checking for live streams
        const response = await fetch('/api/streams/check-live', {
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        if (response.ok) {
          const data = await response.json()
          if (data.newLiveStream) {
            handleNewLiveStream(data.newLiveStream)
          }
        }
      } catch (error) {
        // Silently fail - API might not be fully configured
        console.log('Live stream check skipped (API not configured)')
      }
    }

    // Listen for custom test events
    const handleTestNotification = (event: any) => {
      if (event.detail) {
        handleNewLiveStream(event.detail)
      }
    }

    window.addEventListener('newLiveStream', handleTestNotification)

    // Check immediately and then every 2 minutes (reduced frequency)
    checkForLiveStreams()
    const interval = setInterval(checkForLiveStreams, 120000)

    return () => {
      clearInterval(interval)
      window.removeEventListener('newLiveStream', handleTestNotification)
    }
  }, [isEnabled])

  const handleNewLiveStream = (stream: any) => {
    // Play notification sound
    playNotificationSound()

    // Show in-app notification
    setNotification({
      show: true,
      streamTitle: stream.title,
      streamId: stream.id,
    })

    // Show browser notification if permission granted
    if (hasPermission && 'Notification' in window) {
      new Notification('🔴 New Live Stream!', {
        body: `${stream.title} is now live!`,
        icon: '/nextwork-icon.png',
        tag: stream.id,
        requireInteraction: false,
      })
    }

    // Auto-hide after 15 seconds
    setTimeout(() => {
      setNotification(null)
    }, 15000)
  }

  const playNotificationSound = () => {
    try {
      // Create a pleasant upward chime notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = audioContext.currentTime
      
      // Pleasant ascending melody (C major triad with added 7th - like iOS notification)
      const melody = [
        { freq: 523.25, time: 0.05, duration: 0.15 },  // C5 - slight delay for clean start
        { freq: 659.25, time: 0.17, duration: 0.15 },  // E5
        { freq: 783.99, time: 0.29, duration: 0.20 },  // G5
        { freq: 987.77, time: 0.43, duration: 0.30 },  // B5 (longer, final note)
      ]

      melody.forEach(note => {
        // Main oscillator (pure tone)
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = note.freq
        oscillator.type = 'sine'

        // Volume envelope - quick attack, gentle decay (louder!)
        const startTime = now + note.time
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01) // Louder: 0.3 (was 0.1)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration)

        oscillator.start(startTime)
        oscillator.stop(startTime + note.duration)

        // Add harmonic for richness (subtle overtone)
        const harmonic = audioContext.createOscillator()
        const harmonicGain = audioContext.createGain()

        harmonic.connect(harmonicGain)
        harmonicGain.connect(audioContext.destination)

        harmonic.frequency.value = note.freq * 2 // One octave higher
        harmonic.type = 'sine'

        harmonicGain.gain.setValueAtTime(0, startTime)
        harmonicGain.gain.linearRampToValueAtTime(0.1, startTime + 0.01) // Subtle harmonic
        harmonicGain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration)

        harmonic.start(startTime)
        harmonic.stop(startTime + note.duration)
      })
    } catch (error) {
      console.log('Audio playback failed:', error)
    }
  }

  const handleViewStream = () => {
    if (notification) {
      window.location.href = `/stream/${notification.streamId}`
    }
  }

  const handleDismiss = () => {
    setNotification(null)
  }

  if (!notification?.show) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideInUp">
      <div className="bg-green-500/20 backdrop-blur-sm rounded-lg shadow-2xl p-4 max-w-sm border-2 border-green-500">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center animate-pulse">
              <Bell className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-white mb-1 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                  New Live Stream!
                </p>
                <p className="text-white font-semibold mb-2">{notification.streamTitle}</p>
                <button
                  onClick={handleViewStream}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-colors shadow-md"
                >
                  Watch Now
                </button>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

