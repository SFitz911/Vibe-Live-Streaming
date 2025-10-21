import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateStreamKey } from '@/lib/utils'
import { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient<Database>(
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

    // Generate unique stream key
    const streamKey = generateStreamKey()

    // In production, you would create an AWS IVS channel here
    // For now, we'll use a placeholder playback URL
    const playbackUrl = `${process.env.AWS_IVS_PLAYBACK_URL || 'https://placeholder.m3u8'}`

    // Temporarily disable database operations for deployment
    const stream = {
      id: Date.now().toString(),
      user_id: userId,
      title,
      description,
      category,
      tags,
      stream_key: streamKey,
      playback_url: playbackUrl,
      is_live: false,
      created_at: new Date().toISOString(),
    }

    // const { data: stream, error } = await supabase
    //   .from('streams')
    //   .insert({
    //     user_id: userId,
    //     title,
    //     description,
    //     category,
    //     tags,
    //     stream_key: streamKey,
    //     playback_url: playbackUrl,
    //     is_live: false,
    //   })
    //   .select()
    //   .single()

    // if (error) {
    //   console.error('Error creating stream:', error)
    //   return NextResponse.json({ error: error.message }, { status: 500 })
    // }

    return NextResponse.json({ stream }, { status: 201 })
  } catch (error) {
    console.error('Error in create stream API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

