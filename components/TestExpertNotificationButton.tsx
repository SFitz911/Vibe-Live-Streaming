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
    <div className="bg-gray-800 rounded-lg p-3 mb-3 border border-gray-700">
      <p className="text-white text-sm font-bold mb-2">Expert Mode Test</p>
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
        <span>Test Expert Alert</span>
      </button>
    </div>
  )
}

