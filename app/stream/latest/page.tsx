'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

export default function LatestStreamPage() {
  const router = useRouter()

  useEffect(() => {
    // In a real app, this would fetch the most recent live stream
    // For now, we'll redirect to a demo live stream
    const redirectToLatestStream = async () => {
      try {
        // Simulate API call to get latest live stream
        // const response = await fetch('/api/streams/latest')
        // const data = await response.json()
        // if (data.stream) {
        //   router.push(`/stream/${data.stream.id}`)
        // } else {
        //   // No live streams, redirect to discover page
        //   router.push('/discover')
        // }
        
        // For demo purposes, redirect to demo live stream
        router.push('/stream/demo-live')
      } catch (error) {
        console.error('Error fetching latest stream:', error)
        // Fallback to demo stream
        router.push('/stream/demo-live')
      }
    }

    redirectToLatestStream()
  }, [router])

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Finding Latest Live Event</h2>
          <p className="text-gray-400">Redirecting you to the most recent live stream...</p>
        </div>
      </div>
    </main>
  )
}
