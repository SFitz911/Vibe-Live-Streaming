/**
 * Clip Capture Utilities
 * Captures 30s, 12s, and frozen thumbnail from live streams at 20-second mark
 */

export interface ClipCaptureResult {
  clip30s: Blob | null;
  clip12s: Blob | null;
  thumbnail: Blob | null;
  error?: string;
}

/**
 * Captures a video clip from MediaStream
 */
export async function captureVideoClip(
  stream: MediaStream,
  durationSeconds: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };

      mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error during clip capture:', error);
        resolve(null);
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms

      // Stop after specified duration
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, durationSeconds * 1000);

    } catch (error) {
      console.error('Error capturing video clip:', error);
      resolve(null);
    }
  });
}

/**
 * Captures a frozen frame (thumbnail) from video element
 */
export async function captureFrozenFrame(videoElement: HTMLVideoElement): Promise<Blob | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 1280;
    canvas.height = videoElement.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return null;
    }

    // Draw current video frame
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Convert to blob (async)
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.85 // Quality: 85%
      );
    });

  } catch (error) {
    console.error('Error capturing frozen frame:', error);
    return null;
  }
}

/**
 * Captures all three assets: 30s clip, 12s clip, and frozen thumbnail
 */
export async function captureAllClips(
  stream: MediaStream,
  videoElement: HTMLVideoElement
): Promise<ClipCaptureResult> {
  console.log('🎬 Starting clip capture...');

  try {
    // Capture frozen frame immediately (await the promise)
    const thumbnailBlob = await captureFrozenFrame(videoElement);
    
    if (!thumbnailBlob) {
      console.error('Failed to capture thumbnail');
    } else {
      console.log('✅ Thumbnail captured:', Math.round(thumbnailBlob.size / 1024), 'KB');
    }

    // Start both video captures simultaneously
    console.log('📹 Starting 30s and 12s clip captures...');
    
    const [clip30sBlob, clip12sBlob] = await Promise.all([
      captureVideoClip(stream, 30),
      captureVideoClip(stream, 12),
    ]);

    if (clip30sBlob) {
      console.log('✅ 30s clip captured:', Math.round(clip30sBlob.size / 1024), 'KB');
    } else {
      console.error('❌ Failed to capture 30s clip');
    }

    if (clip12sBlob) {
      console.log('✅ 12s clip captured:', Math.round(clip12sBlob.size / 1024), 'KB');
    } else {
      console.error('❌ Failed to capture 12s clip');
    }

    return {
      clip30s: clip30sBlob,
      clip12s: clip12sBlob,
      thumbnail: thumbnailBlob,
    };

  } catch (error) {
    console.error('Error in captureAllClips:', error);
    return {
      clip30s: null,
      clip12s: null,
      thumbnail: null,
      error: String(error),
    };
  }
}

/**
 * Uploads captured clips to the server
 */
export async function uploadClips(
  streamId: string,
  clips: ClipCaptureResult
): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('streamId', streamId);

    if (clips.clip30s) {
      formData.append('clip30s', clips.clip30s, 'clip-30s.webm');
    }

    if (clips.clip12s) {
      formData.append('clip12s', clips.clip12s, 'clip-12s.webm');
    }

    if (clips.thumbnail) {
      formData.append('thumbnail', clips.thumbnail, 'thumbnail.jpg');
    }

    console.log('📤 Uploading clips to server...');

    const response = await fetch('/api/streams/capture-clips', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Upload failed:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Clips uploaded successfully:', result);
    return true;

  } catch (error) {
    console.error('Error uploading clips:', error);
    return false;
  }
}

