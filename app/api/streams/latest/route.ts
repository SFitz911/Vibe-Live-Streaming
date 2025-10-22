import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'
// import { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would query the database for the most recent live stream
    // const supabase = createClient<Database>(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_ROLE_KEY!
    // )

    // const { data: stream, error } = await supabase
    //   .from('streams')
    //   .select('*')
    //   .eq('is_live', true)
    //   .order('created_at', { ascending: false })
    //   .limit(1)
    //   .single()

    // if (error || !stream) {
    //   return NextResponse.json({ error: 'No live streams found' }, { status: 404 })
    // }

    // return NextResponse.json({ stream })

    // For demo purposes, return a demo stream
    const demoStream = {
      id: 'demo-live',
      title: 'Live Coding Session - Building with AI',
      description: 'Join us for an interactive coding session exploring AI tools and cloud technologies',
      user_id: 'demo-user',
      is_live: true,
      viewer_count: 42,
      created_at: new Date().toISOString(),
      playback_url: 'https://demo.m3u8',
      category: 'AI & Machine Learning',
      tags: ['coding', 'ai', 'live', 'tutorial'],
    }

    return NextResponse.json({ stream: demoStream })
  } catch (error) {
    console.error('Error fetching latest stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
