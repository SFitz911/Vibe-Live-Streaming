import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cleanupOldRecordings } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const formData = await request.formData()
    const file = formData.get('file') as File
    const streamId = formData.get('streamId') as string

    if (!file || !streamId) {
      return NextResponse.json(
        { error: 'File and streamId are required' },
        { status: 400 }
      )
    }

    // Check if cleanup is needed before uploading
    await cleanupOldRecordings(file.size)

    // Upload to Supabase Storage
    const recordingFileName = `${streamId}_${Date.now()}.webm`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('stream-recordings')
      .upload(recordingFileName, file, {
        contentType: 'video/webm',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('stream-recordings')
      .getPublicUrl(recordingFileName)

    // Update stream record with playback URL
    await supabase
      .from('streams')
      .update({
        playback_url: urlData.publicUrl,
        is_live: false,
        ended_at: new Date().toISOString(),
      })
      .eq('id', streamId)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: recordingFileName,
    }, { status: 200 })
  } catch (error) {
    console.error('Error in upload-recording API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

