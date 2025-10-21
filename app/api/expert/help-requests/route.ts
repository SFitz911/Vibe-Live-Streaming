import { NextResponse } from 'next/server'

// Store recent help requests in memory (in production, use a database)
const recentHelpRequests = new Map<string, any>()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const expertEmail = searchParams.get('expert')

    // In a real implementation, this would:
    // 1. Query database for help requests assigned to this expert
    // 2. Filter by unacknowledged requests
    // 3. Return the most recent one

    // For demo purposes, return null
    return NextResponse.json({ newRequest: null })
  } catch (error) {
    console.error('Error fetching help requests:', error)
    return NextResponse.json({ newRequest: null })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { expertEmail, requesterName, topic, urgency, streamId } = body

    const helpRequest = {
      id: `help-${Date.now()}`,
      expertEmail,
      requesterName,
      topic: topic || 'General assistance needed',
      urgency: urgency || 'medium',
      timestamp: new Date().toISOString(),
      streamId,
    }

    // Store the request
    recentHelpRequests.set(helpRequest.id, helpRequest)

    // Clean up after 5 minutes
    setTimeout(() => {
      recentHelpRequests.delete(helpRequest.id)
    }, 5 * 60 * 1000)

    return NextResponse.json({ success: true, helpRequest })
  } catch (error) {
    console.error('Error creating help request:', error)
    return NextResponse.json({ error: 'Failed to create help request' }, { status: 500 })
  }
}

