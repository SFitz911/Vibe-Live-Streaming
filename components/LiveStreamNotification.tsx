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

    // Check for new live streams every 30 seconds
    const checkForLiveStreams = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate checking for live streams
        const response = await fetch('/api/streams/check-live')
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

    // Check immediately and then every 30 seconds
    checkForLiveStreams()
    const interval = setInterval(checkForLiveStreams, 30000)

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

    // Auto-hide after 10 seconds
    setTimeout(() => {
      setNotification(null)
    }, 10000)
  }

  const playNotificationSound = () => {
    // Create a pleasant bell sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Create oscillators for a pleasant bell sound (E5 chord)
    const frequencies = [659.25, 783.99, 987.77] // E5, G5, B5
    const now = audioContext.currentTime

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = freq
      oscillator.type = 'sine'

      // Envelope for bell-like sound
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.1 - (index * 0.02), now + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5)

      oscillator.start(now + (index * 0.05))
      oscillator.stop(now + 1.5)
    })
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
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg shadow-2xl p-4 max-w-sm border-2 border-primary-400/50">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center animate-pulse">
              <Bell className="h-6 w-6 text-primary-600" />
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
                  className="bg-white text-primary-600 px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors"
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

