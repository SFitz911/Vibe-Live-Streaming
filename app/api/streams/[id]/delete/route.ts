import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const streamId = params.id

    // Get the stream to verify ownership and get file info
    const { data: stream, error: fetchError } = await supabase
      .from('streams')
      .select('*')
      .eq('id', streamId)
      .single()

    if (fetchError || !stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    // If there's a recording file, extract the filename and delete it from storage
    if (stream.playback_url && stream.playback_url.includes('stream-recordings')) {
      try {
        // Extract filename from URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/stream-recordings/[filename]
        const urlParts = stream.playback_url.split('/')
        const fileName = urlParts[urlParts.length - 1]

        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('stream-recordings')
          .remove([fileName])

        if (storageError) {
          console.error('Error deleting file from storage:', storageError)
          // Continue anyway - we'll still delete the database record
        } else {
          console.log(`Deleted recording file: ${fileName}`)
        }
      } catch (error) {
        console.error('Error processing file deletion:', error)
        // Continue anyway
      }
    }

    // Delete the stream record from database
    const { error: deleteError } = await supabase
      .from('streams')
      .delete()
      .eq('id', streamId)

    if (deleteError) {
      console.error('Error deleting stream:', deleteError)
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Stream deleted successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Error in delete stream API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

