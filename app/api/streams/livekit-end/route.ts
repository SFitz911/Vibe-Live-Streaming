import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Create client without strict typing to avoid build errors
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { streamId } = await request.json()

    if (!streamId) {
      return NextResponse.json(
        { error: 'streamId is required' },
        { status: 400 }
      )
    }

    // Get the current stream data first
    const { data: currentStream, error: fetchError } = await supabase
      .from('streams')
      .select('*')
      .eq('id', streamId)
      .single()

    if (fetchError || !currentStream) {
      console.error('Error fetching stream:', fetchError)
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    // Calculate 30 minutes from now
    const thirtyMinutesFromNow = new Date()
    thirtyMinutesFromNow.setMinutes(thirtyMinutesFromNow.getMinutes() + 30)

    // Prepare update data
    const updateData: any = {
      is_live: false,
      ended_at: new Date().toISOString(),
      recently_live_until: thirtyMinutesFromNow.toISOString(), // Stay in "Live Now" for 30 min
    }

    // If stream has a thumbnail but no playback_url, set playback_url to thumbnail
    // This makes the recording "playable" (shows the thumbnail as the recording)
    if (currentStream.thumbnail_url && !currentStream.playback_url) {
      updateData.playback_url = currentStream.thumbnail_url
    }

    // Update the stream - mark as ended but keep visible in "Live Now" for 30 min
    const { error: updateError } = await supabase
      .from('streams')
      .update(updateData)
      .eq('id', streamId)

    if (updateError) {
      console.error('Error ending stream:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Stream ended successfully - will remain in Live Now for 30 minutes',
      recently_live_until: thirtyMinutesFromNow.toISOString()
    }, { status: 200 })
  } catch (error) {
    console.error('Error in livekit-end API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



