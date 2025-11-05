import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Create client without strict typing to avoid build errors
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { title, description, category, tags, userId } = await request.json()

    if (!title || !userId) {
      return NextResponse.json(
        { error: 'Title and userId are required' },
        { status: 400 }
      )
    }

    // Generate a unique room name for LiveKit
    const roomName = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // Placeholder playback URL (will be set when going live with LiveKit)
    const playbackUrl = `ws://localhost:7880/${roomName}`

    // Create the stream record in the database (NOT LIVE yet)
    const { data: stream, error } = await supabase
      .from('streams')
      .insert({
        user_id: userId,
        title,
        description: description || '',
        category,
        tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
        stream_key: roomName,
        playback_url: playbackUrl,
        is_live: false, // Stream is created but not live yet
        viewer_count: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating stream:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ stream }, { status: 201 })
  } catch (error) {
    console.error('Error in create stream API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

