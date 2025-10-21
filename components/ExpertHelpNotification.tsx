'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, X, Mail, MessageSquare } from 'lucide-react'

interface ExpertHelpNotificationProps {
  expertEmail?: string // If provided, only show notifications for this expert
  isEnabled?: boolean
}

interface HelpRequest {
  id: string
  requesterName: string
  topic: string
  urgency: 'low' | 'medium' | 'high'
  timestamp: string
  streamId?: string
}

export default function ExpertHelpNotification({ 
  expertEmail, 
  isEnabled = true 
}: ExpertHelpNotificationProps) {
  const [notification, setNotification] = useState<{
    show: boolean
    request: HelpRequest
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

    // Check for help requests every 15 seconds (more frequent for experts)
    const checkForHelpRequests = async () => {
      try {
        const url = expertEmail 
          ? `/api/expert/help-requests?expert=${encodeURIComponent(expertEmail)}`
          : '/api/expert/help-requests'
        
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          if (data.newRequest) {
            handleNewHelpRequest(data.newRequest)
          }
        }
      } catch (error) {
        // Silently fail - API might not be fully configured
        console.log('Help request check skipped (API not configured)')
      }
    }

    // Listen for custom test events
    const handleTestNotification = (event: any) => {
      if (event.detail) {
        handleNewHelpRequest(event.detail)
      }
    }

    window.addEventListener('expertHelpRequest', handleTestNotification)

    // Check immediately and then every 15 seconds
    checkForHelpRequests()
    const interval = setInterval(checkForHelpRequests, 15000)

    return () => {
      clearInterval(interval)
      window.removeEventListener('expertHelpRequest', handleTestNotification)
    }
  }, [isEnabled, expertEmail])

  const handleNewHelpRequest = (request: HelpRequest) => {
    // Play urgent notification sound
    playExpertAlertSound(request.urgency)

    // Show in-app notification
    setNotification({
      show: true,
      request,
    })

    // Show browser notification if permission granted
    if (hasPermission && 'Notification' in window) {
      const urgencyEmoji = request.urgency === 'high' ? '🚨' : request.urgency === 'medium' ? '⚠️' : '💡'
      new Notification(`${urgencyEmoji} Help Request from ${request.requesterName}`, {
        body: `Topic: ${request.topic}`,
        icon: '/nextwork-icon.png',
        tag: request.id,
        requireInteraction: request.urgency === 'high',
      })
    }

    // Auto-hide after 20 seconds (longer for experts to respond)
    setTimeout(() => {
      setNotification(null)
    }, 20000)
  }

  const playExpertAlertSound = (urgency: 'low' | 'medium' | 'high') => {
    // Create a submarine diving alarm sound - descending "woop woop"
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const now = audioContext.currentTime

    // Different urgency levels have different dive speeds
    const repeatCount = urgency === 'high' ? 3 : urgency === 'medium' ? 2 : 1

    for (let i = 0; i < repeatCount; i++) {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.type = 'sawtooth' // Classic submarine alarm sound
      
      const startTime = now + (i * 0.6)
      const duration = 0.5

      // Submarine dive: sweep from high to low frequency
      oscillator.frequency.setValueAtTime(800, startTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, startTime + duration)

      // Volume envelope - fade in and out for "woop" effect
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05)
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + duration - 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    }

    // Add a second layer for more depth (submarine sonar ping effect)
    if (urgency === 'high') {
      const pingOscillator = audioContext.createOscillator()
      const pingGain = audioContext.createGain()
      
      pingOscillator.connect(pingGain)
      pingGain.connect(audioContext.destination)
      
      pingOscillator.type = 'sine'
      pingOscillator.frequency.value = 200
      
      const pingStart = now + (repeatCount * 0.6)
      pingGain.gain.setValueAtTime(0.15, pingStart)
      pingGain.gain.exponentialRampToValueAtTime(0.01, pingStart + 0.3)
      
      pingOscillator.start(pingStart)
      pingOscillator.stop(pingStart + 0.3)
    }
  }

  const handleRespond = () => {
    if (notification) {
      // In a real app, this would open a response interface
      // For now, we'll redirect to the stream or open email
      if (notification.request.streamId) {
        window.location.href = `/stream/${notification.request.streamId}`
      } else {
        alert(`Responding to help request from ${notification.request.requesterName}`)
      }
    }
  }

  const handleDismiss = () => {
    setNotification(null)
  }

  if (!notification?.show) return null

  const urgencyColors = {
    low: 'from-blue-600 to-blue-700 border-blue-400',
    medium: 'from-yellow-600 to-orange-600 border-yellow-400',
    high: 'from-red-600 to-red-700 border-red-400',
  }

  const urgencyIcons = {
    low: '💡',
    medium: '⚠️',
    high: '🚨',
  }

  return (
    <div className="fixed top-6 right-6 z-50 animate-slideInDown">
      <div className={`bg-gradient-to-r ${urgencyColors[notification.request.urgency]} rounded-lg shadow-2xl p-5 max-w-md border-2`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center animate-pulse">
              <AlertCircle className="h-7 w-7 text-red-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-bold text-white mb-1 flex items-center">
                  <span className="mr-2">{urgencyIcons[notification.request.urgency]}</span>
                  Help Request - {notification.request.urgency.toUpperCase()} Priority
                </p>
                <p className="text-white font-semibold mb-1">
                  From: {notification.request.requesterName}
                </p>
                <p className="text-white/90 text-sm mb-3">
                  Topic: {notification.request.topic}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleRespond}
                    className="bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-100 transition-colors flex items-center space-x-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Respond</span>
                  </button>
                  <button
                    onClick={() => {
                      const email = `mailto:${notification.request.requesterName}@example.com?subject=Re: ${notification.request.topic}`
                      window.open(email, '_blank')
                    }}
                    className="bg-white/20 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-white/30 transition-colors flex items-center space-x-1"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white transition-colors ml-2"
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

