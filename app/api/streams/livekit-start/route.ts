import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Create client without strict typing to avoid build errors
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { roomName, userName, userId, title, description, category, tags } = await request.json()

    if (!roomName || !userName) {
      return NextResponse.json(
        { error: 'roomName and userName are required' },
        { status: 400 }
      )
    }

    // Use authenticated user ID, fallback to Natasha for testing/development
    const streamUserId = userId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

    // Create the stream record
    const { data: stream, error } = await supabase
      .from('streams')
      .insert({
        user_id: streamUserId,
        title: title || `${userName}'s Live Stream`,
        description: description || 'Live streaming now!',
        category: category || 'Web Development',
        tags: tags || [],
        stream_key: roomName,
        playback_url: null, // Will be set by upload-recording API after stream ends
        is_live: true,
        viewer_count: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating stream:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      streamId: stream.id,
      message: 'Stream started successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error in livekit-start API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

