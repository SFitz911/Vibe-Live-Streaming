import { supabase } from './supabase'

/**
 * Capture a 3-second video clip from a live stream
 * Used for creating animated thumbnails
 */
export async function captureLiveStreamThumbnail(
  videoElement: HTMLVideoElement,
  streamId: string
): Promise<{ url: string | null; error: any }> {
  try {
    // Create a MediaRecorder for the thumbnail
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) throw new Error('Canvas context not available')

    // Set canvas size to match video (or standard thumbnail size)
    canvas.width = 1280
    canvas.height = 720

    // Create a stream from canvas
    const canvasStream = canvas.captureStream(30) // 30 fps
    
    // Add audio from video if available
    const videoStream = videoElement.srcObject as MediaStream
    const audioTracks = videoStream?.getAudioTracks() || []
    audioTracks.forEach(track => canvasStream.addTrack(track))

    const recorder = new MediaRecorder(canvasStream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
    })

    const chunks: Blob[] = []

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    return new Promise((resolve) => {
      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: 'video/webm' })
          
          // Upload to Supabase Storage
          const fileName = `thumbnail_${streamId}_${Date.now()}.webm`
          
          const { data, error: uploadError } = await supabase.storage
            .from('stream-recordings')
            .upload(`thumbnails/${fileName}`, blob, {
              contentType: 'video/webm',
              cacheControl: '3600',
            })

          if (uploadError) {
            console.error('Error uploading thumbnail:', uploadError)
            resolve({ url: null, error: uploadError })
            return
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

          console.log('Live thumbnail created:', urlData.publicUrl)
          resolve({ url: urlData.publicUrl, error: null })
        } catch (error) {
          console.error('Error in thumbnail creation:', error)
          resolve({ url: null, error })
        }
      }

      // Start recording thumbnail
      recorder.start()

      // Draw video frames to canvas for 15 seconds
      let frameCount = 0
      const maxFrames = 30 * 15 // 15 seconds at 30fps = 450 frames
      
      const drawFrame = () => {
        if (frameCount >= maxFrames) {
          recorder.stop()
          return
        }

        // Draw current video frame to canvas
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
        frameCount++
        
        requestAnimationFrame(drawFrame)
      }

      drawFrame()
    })
  } catch (error) {
    console.error('Error capturing thumbnail:', error)
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
  console.log(`Thumbnail will be captured in ${delayMinutes} minutes...`)
  
  return setTimeout(async () => {
    console.log('Capturing live stream thumbnail...')
    const result = await captureLiveStreamThumbnail(videoElement, streamId)
    
    if (result.url) {
      console.log('✅ Thumbnail captured and uploaded!')
    } else {
      console.error('❌ Failed to capture thumbnail:', result.error)
    }
  }, delayMinutes * 60 * 1000) // Convert minutes to milliseconds
}

