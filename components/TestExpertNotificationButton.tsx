'use client'

import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

interface ExpertNotificationProps {
  streamId?: string
  streamTitle?: string
}

export default function TestExpertNotificationButton({ streamId, streamTitle }: ExpertNotificationProps = {}) {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium')

  // Play the alert sound for both sender and receiver
  const playAlertSound = (urgency: 'low' | 'medium' | 'high') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = audioContext.currentTime

      // Different urgency levels have different sound repetitions
      const repeatCount = urgency === 'high' ? 6 : urgency === 'medium' ? 4 : 2

      for (let i = 0; i < repeatCount; i++) {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.type = 'sawtooth' // Classic submarine alarm sound
        
        const startTime = now + (i * 0.4)
        const duration = 0.3

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
        
        const pingStart = now + (repeatCount * 0.4)
        pingGain.gain.setValueAtTime(0.15, pingStart)
        pingGain.gain.exponentialRampToValueAtTime(0.01, pingStart + 0.3)
        
        pingOscillator.start(pingStart)
        pingOscillator.stop(pingStart + 0.3)
      }
    } catch (error) {
      console.error('Audio playback failed:', error)
    }
  }

  const triggerTestExpertNotification = async () => {
    if (!user) {
      alert('Please log in to send messages')
      return
    }

    // Play sound immediately for the SENDER
    playAlertSound(urgency)

    setLoading(true)
    
    try {
      // Get all admin users (@nextwork.org emails)
      const { data: staffUsers } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', '%@nextwork.org')

      if (!staffUsers || staffUsers.length === 0) {
        alert('No admin staff available at the moment')
        setLoading(false)
        return
      }

      console.log(`Sending alert to ${staffUsers.length} Nextwork.org admins`)

      // Create urgency message
      const urgencyText = urgency === 'high' ? '🚨 HIGH PRIORITY' : urgency === 'medium' ? '⚠️ MEDIUM' : '💬 LOW'
      const streamInfo = streamTitle ? ` in "${streamTitle}"` : ''
      const messageText = `${urgencyText} Question${streamInfo}\n\nStudent needs help! Please check the live stream chat or send a direct message.`

      // Send DM to all staff members
      const messages = staffUsers.map(staff => ({
        sender_id: user.id,
        recipient_id: staff.id,
        message: messageText,
      }))

      const { error } = await supabase
        .from('direct_messages')
        .insert(messages)

      if (error) throw error

      // Also dispatch event for notification system (so RECEIVERS hear it too)
      const event = new CustomEvent('expertHelpRequest', {
        detail: {
          id: `help-${Date.now()}`,
          requesterName: profile?.display_name || profile?.username || 'Student',
          topic: messageText,
          urgency: urgency,
          timestamp: new Date().toISOString(),
          streamId: streamId || 'unknown',
        }
      })
      window.dispatchEvent(event)

      alert('✅ Staff members have been notified!')
    } catch (error) {
      console.error('Error notifying staff:', error)
      alert('Failed to notify staff. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-3 mb-3 border border-gray-700">
      <p className="text-white text-sm font-bold mb-2">I have a Question</p>
      <div className="flex space-x-1 mb-2">
        <button
          onClick={() => setUrgency('low')}
          className={`px-2 py-1 rounded text-xs font-semibold ${
            urgency === 'low' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          Low (2x)
        </button>
        <button
          onClick={() => setUrgency('medium')}
          className={`px-2 py-1 rounded text-xs font-semibold ${
            urgency === 'medium' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          Medium (4x)
        </button>
        <button
          onClick={() => setUrgency('high')}
          className={`px-2 py-1 rounded text-xs font-semibold ${
            urgency === 'high' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          High (6x)
        </button>
      </div>
      <button
        onClick={triggerTestExpertNotification}
        disabled={loading}
        className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-bold transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
      >
        <AlertCircle className="h-4 w-4" />
        <span>Alert Staff of Question</span>
      </button>
    </div>
  )
}

