import { supabase } from './supabase'

/**
 * Capture a static image thumbnail from a live stream
 * Takes a single frame snapshot and uploads as JPEG
 */
export async function captureLiveStreamThumbnail(
  videoElement: HTMLVideoElement,
  streamId: string
): Promise<{ url: string | null; error: any }> {
  try {
    // Create canvas to capture video frame
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) throw new Error('Canvas context not available')

    // Set canvas size to standard 720p thumbnail
    canvas.width = 1280
    canvas.height = 720

    // Draw current video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

    // Convert canvas to JPEG blob (much smaller than video!)
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.85 // 85% quality - good balance between size and quality
      )
    })

    if (!blob) {
      throw new Error('Failed to create image blob')
    }

    // Upload to Supabase Storage
    const fileName = `thumbnail_${streamId}_${Date.now()}.jpg`
    
    const { data, error: uploadError } = await supabase.storage
      .from('stream-recordings')
      .upload(`thumbnails/${fileName}`, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Error uploading thumbnail:', uploadError)
      return { url: null, error: uploadError }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('stream-recordings')
      .getPublicUrl(`thumbnails/${fileName}`)

    // Update stream record with thumbnail URL
    await supabase
      .from('streams')
      .update({ thumbnail_url: urlData.publicUrl })
      .eq('id', streamId)

    console.log('✅ Static thumbnail captured and uploaded:', urlData.publicUrl)
    return { url: urlData.publicUrl, error: null }
  } catch (error) {
    console.error('❌ Error capturing thumbnail:', error)
    return { url: null, error }
  }
}

/**
 * Schedule automatic thumbnail capture after stream has been live for 2 minutes
 */
export function scheduleAutomaticThumbnailCapture(
  videoElement: HTMLVideoElement,
  streamId: string,
  delayMinutes: number = 2
): NodeJS.Timeout {
  console.log(`📸 Thumbnail will be captured in ${delayMinutes} minutes...`)
  
  return setTimeout(async () => {
    console.log('📸 Capturing live stream thumbnail...')
    const result = await captureLiveStreamThumbnail(videoElement, streamId)
    
    if (result.url) {
      console.log('✅ Thumbnail captured and uploaded!')
    } else {
      console.error('❌ Failed to capture thumbnail:', result.error)
    }
  }, delayMinutes * 60 * 1000) // Convert minutes to milliseconds
}
