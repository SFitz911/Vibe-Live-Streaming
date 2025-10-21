import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const streamId = params.id

    // Update stream status to live
    // Temporarily disable database operations for deployment
    const stream = {
      id: streamId,
      is_live: true,
      started_at: new Date().toISOString(),
    }

    // const { data: stream, error } = await supabase
    //   .from('streams')
    //   .update({
    //     is_live: true,
    //     started_at: new Date().toISOString(),
    //   })
    //   .eq('id', streamId)
    //   .select()
    //   .single()

    // if (error) {
    //   console.error('Error starting stream:', error)
    //   return NextResponse.json({ error: error.message }, { status: 500 })
    // }

    return NextResponse.json({ stream }, { status: 200 })
  } catch (error) {
    console.error('Error in start stream API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

