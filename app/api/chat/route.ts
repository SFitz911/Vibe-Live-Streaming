import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { streamId, userId, message } = await request.json()

    if (!streamId || !userId || !message) {
      return NextResponse.json(
        { error: 'StreamId, userId, and message are required' },
        { status: 400 }
      )
    }

    // Check if message is within length limit
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long (max 500 characters)' },
        { status: 400 }
      )
    }

    const { data: chatMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        stream_id: streamId,
        user_id: userId,
        message: message.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error sending chat message:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ chatMessage }, { status: 201 })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

