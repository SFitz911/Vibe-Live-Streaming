import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Extract YouTube video ID from URL (supports regular videos, Shorts, and live streams)
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /youtube\.com\/live\/([^&\?\/]+)/,
    /youtube\.com\/shorts\/([^&\?\/]+)/,  // YouTube Shorts support
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { youtubeUrl, title, description, category, userId } = await request.json()

    if (!youtubeUrl || !title || !userId) {
      return NextResponse.json(
        { error: 'YouTube URL, title, and userId are required' },
        { status: 400 }
      )
    }

    // Extract video ID
    const videoId = getYouTubeVideoId(youtubeUrl)
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL. Please use a valid YouTube link.' },
        { status: 400 }
      )
    }

    // Generate thumbnail URL from YouTube
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    // Create stream record with YouTube info
    const { data: stream, error } = await supabase
      .from('streams')
      .insert({
        user_id: userId,
        title,
        description: description || `Imported from YouTube`,
        category: category || 'Web Development',
        stream_key: `youtube-${videoId}`,
        playback_url: youtubeUrl, // Store original YouTube URL
        thumbnail_url: thumbnailUrl,
        is_live: false, // YouTube imports are always recordings
        viewer_count: 0,
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error importing YouTube video:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      stream,
      message: 'YouTube video imported successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error in import-youtube API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

