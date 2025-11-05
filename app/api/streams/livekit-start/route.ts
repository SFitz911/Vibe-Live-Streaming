import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { roomName, userName, title, description, category, tags } = await request.json()

    if (!roomName || !userName) {
      return NextResponse.json(
        { error: 'roomName and userName are required' },
        { status: 400 }
      )
    }

    // For development: Use Natasha from Nextwork instructors
    // In production, this would come from the authenticated user
    const testUserId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Natasha from setup-all-data.sql

    // Create the stream record
    const { data: stream, error } = await supabase
      .from('streams')
      .insert({
        user_id: testUserId,
        title: title || `${userName}'s Live Stream`,
        description: description || 'Live streaming now!',
        category: category || 'Web Development',
        tags: tags || [],
        stream_key: roomName,
        playback_url: `ws://localhost:7880/${roomName}`,
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

