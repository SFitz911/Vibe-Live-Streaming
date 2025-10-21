'use client'

import { useEffect, useRef } from 'react'

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
    if (videoRef.current && playbackUrl) {
      // For HLS streams, we would use hls.js here
      // For now, using native HTML5 video
      videoRef.current.src = playbackUrl
      if (autoplay) {
        videoRef.current.play().catch((err) => {
          console.error('Autoplay failed:', err)
        })
      }
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
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

