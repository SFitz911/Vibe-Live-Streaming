'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface VideoPlayerProps {
  playbackUrl: string
  autoplay?: boolean
  muted?: boolean
}

export default function VideoPlayer({
  playbackUrl,
  autoplay = true,
  muted = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current || !playbackUrl) return

    const video = videoRef.current

    if (Hls.isSupported()) {
      // Use HLS.js for better compatibility
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      })
      
      hls.loadSource(playbackUrl)
      hls.attachMedia(video)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed, starting playback')
        if (autoplay) {
          video.play().catch((err) => {
            console.error('Autoplay failed:', err)
          })
        }
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data)
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Fatal network error encountered, try to recover')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Fatal media error encountered, try to recover')
              hls.recoverMediaError()
              break
            default:
              console.log('Fatal error, cannot recover')
              hls.destroy()
              break
          }
        }
      })

      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = playbackUrl
      if (autoplay) {
        video.play().catch((err) => {
          console.error('Autoplay failed:', err)
        })
      }
    } else {
      console.error('HLS is not supported in this browser')
    }
  }, [playbackUrl, autoplay])

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        autoPlay={autoplay}
        muted={muted}
        playsInline
        crossOrigin="anonymous"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

