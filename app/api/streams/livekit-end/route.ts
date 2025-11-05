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

    // Update the stream to mark it as ended
    const { error } = await supabase
      .from('streams')
      .update({
        is_live: false,
        ended_at: new Date().toISOString(),
      })
      .eq('id', streamId)

    if (error) {
      console.error('Error ending stream:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Stream ended successfully' 
    }, { status: 200 })
  } catch (error) {
    console.error('Error in livekit-end API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



