'use client'

import { Bell } from 'lucide-react'
import { useState } from 'react'

export default function TestNotificationButton() {
  const [loading, setLoading] = useState(false)

  const triggerTestNotification = () => {
    setLoading(true)
    
    // Play notification sound
    playNotificationSound()
    
    // Create a custom event that the notification component will listen for
    const event = new CustomEvent('newLiveStream', {
      detail: {
        id: `test-${Date.now()}`,
        title: 'Test Stream: Learning MCP with AI Agents',
        user_id: 'test-user',
        created_at: new Date().toISOString(),
      }
    })
    window.dispatchEvent(event)
    
    setTimeout(() => setLoading(false), 500)
  }

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const frequencies = [659.25, 783.99, 987.77]
      const now = audioContext.currentTime

      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = freq
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(0.1 - (index * 0.02), now + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5)

        oscillator.start(now + (index * 0.05))
        oscillator.stop(now + 1.5)
      })
    } catch (error) {
      console.error('Audio playback failed:', error)
    }
  }

  return (
    <button
      onClick={triggerTestNotification}
      disabled={loading}
      className="fixed bottom-6 left-6 z-50 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
      title="Test the live stream notification system"
    >
      <Bell className="h-5 w-5" />
      <span>Test Notification</span>
    </button>
  )
}

