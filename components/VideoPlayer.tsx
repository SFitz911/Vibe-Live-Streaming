'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface VideoPlayerProps {
  playbackUrl: string
  autoplay?: boolean
  muted?: boolean
  isLive?: boolean
}

// Extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /youtube\.com\/live\/([^&\?\/]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

export default function VideoPlayer({
  playbackUrl,
  autoplay = true,
  muted = false,
  isLive = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Check if URL is a YouTube video
  const youtubeVideoId = getYouTubeVideoId(playbackUrl)

  // If it's YouTube, render iframe instead
  if (youtubeVideoId) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }

  // Check if URL is a direct video file (webm, mp4, etc.)
  const isDirectVideo = playbackUrl.match(/\.(webm|mp4|mov|avi)(\?|$)/i)

  // If it's a direct video file, use native video player
  if (isDirectVideo) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={playbackUrl}
          className="absolute inset-0 w-full h-full"
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

  // Otherwise, treat as HLS stream (for live streams or .m3u8 URLs)
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full"
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

