'use client'

import { AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function TestExpertNotificationButton() {
  const [loading, setLoading] = useState(false)
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium')

  const triggerTestExpertNotification = () => {
    setLoading(true)
    
    // Create a custom event that the expert notification component will listen for
    const event = new CustomEvent('expertHelpRequest', {
      detail: {
        id: `help-test-${Date.now()}`,
        requesterName: 'John Student',
        topic: urgency === 'high' 
          ? 'URGENT: AWS Deployment Failing' 
          : urgency === 'medium'
          ? 'Question about Docker Configuration'
          : 'General AI Learning Question',
        urgency: urgency,
        timestamp: new Date().toISOString(),
        streamId: 'test-stream',
      }
    })
    window.dispatchEvent(event)
    
    setTimeout(() => setLoading(false), 500)
  }

  return (
    <div className="fixed top-20 left-6 z-50 bg-gray-900 rounded-lg p-4 shadow-2xl border border-gray-700">
      <p className="text-white text-sm font-bold mb-2">Expert Mode Test</p>
      <div className="flex space-x-2 mb-3">
        <button
          onClick={() => setUrgency('low')}
          className={`px-3 py-1 rounded text-xs font-semibold ${
            urgency === 'low' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          Low
        </button>
        <button
          onClick={() => setUrgency('medium')}
          className={`px-3 py-1 rounded text-xs font-semibold ${
            urgency === 'medium' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          Medium
        </button>
        <button
          onClick={() => setUrgency('high')}
          className={`px-3 py-1 rounded text-xs font-semibold ${
            urgency === 'high' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          High
        </button>
      </div>
      <button
        onClick={triggerTestExpertNotification}
        disabled={loading}
        className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        <AlertCircle className="h-5 w-5" />
        <span>Test Expert Alert</span>
      </button>
    </div>
  )
}

