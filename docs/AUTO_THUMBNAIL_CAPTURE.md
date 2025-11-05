# 🎬 Automatic Live Stream Thumbnail Capture

## Overview

The platform automatically captures animated 3-second video clips from live streams to use as thumbnails. This makes live streams more engaging and helps viewers see what's happening before they join.

---

## How It Works

### 1. **Streamer Goes Live**
- User starts streaming via browser (camera or screen share)
- System shows "Nextwork.org Classroom" placeholder initially

### 2. **Auto-Capture After 2 Minutes**
- After streaming for **2 minutes**, the system automatically:
  - Records a **3-second video clip** from the live stream
  - Uploads it to Supabase Storage (`stream-recordings/thumbnails/`)
  - Updates the stream record with the new thumbnail URL

### 3. **Thumbnail Display**
- The animated clip **replaces** the placeholder
- Displays on:
  - Homepage (Live Now section)
  - Discover page (All live streams)
  - Stream cards everywhere
- Video loops automatically
- Muted by default (sound on hover could be added later)

---

## Technical Implementation

### Files Modified

1. **`lib/thumbnail.ts`** (NEW)
   - `captureLiveStreamThumbnail()` - Captures 3-second video clip
   - `scheduleAutomaticThumbnailCapture()` - Schedules capture after X minutes

2. **`components/LiveKitGoLive.tsx`**
   - Added thumbnail capture scheduling
   - Passes video element reference for capture
   - Triggers after 2 minutes of streaming

3. **`components/StreamCard.tsx`**
   - Detects `.webm` thumbnail URLs
   - Renders `<video>` element for animated thumbnails
   - Fallback to static image or placeholder

4. **`supabase-thumbnail-storage.sql`** (NEW)
   - Storage policies for thumbnail uploads
   - Public read access for thumbnails

### Storage Structure

```
stream-recordings/
├── thumbnails/
│   ├── thumbnail_STREAM_ID_TIMESTAMP.webm  (3-second clips)
│   └── ...
└── recordings/
    ├── STREAM_ID.webm  (full recordings)
    └── ...
```

---

## Configuration

### Capture Timing

Default: **2 minutes** after going live

To change this, edit `components/LiveKitGoLive.tsx`:

```typescript
thumbnailTimerRef.current = scheduleAutomaticThumbnailCapture(
    videoRef.current,
    streamId,
    2 // Change this number (in minutes)
);
```

### Clip Duration

Default: **3 seconds** at 30fps

To change this, edit `lib/thumbnail.ts`:

```typescript
const maxFrames = 30 * 3 // 30fps * seconds
```

### Video Quality

Default: **2.5 Mbps** bitrate, 1280x720 resolution

To change this, edit `lib/thumbnail.ts`:

```typescript
const recorder = new MediaRecorder(canvasStream, {
  mimeType: 'video/webm;codecs=vp9',
  videoBitsPerSecond: 2500000, // Change this (bits per second)
})

canvas.width = 1280  // Change resolution
canvas.height = 720
```

---

## Storage Management

### File Sizes

- **3-second clip** at 2.5 Mbps ≈ **900 KB per thumbnail**
- Much smaller than full recordings
- Automatically overwrites if stream restarts

### Cleanup

Thumbnails are **automatically deleted** when:
- The stream is deleted
- A new thumbnail is captured (replaces old one)

### Manual Cleanup

If needed, delete thumbnails via Supabase Storage dashboard or SQL:

```sql
-- Delete all thumbnails older than 30 days
DELETE FROM storage.objects
WHERE bucket_id = 'stream-recordings'
  AND (storage.foldername(name))[1] = 'thumbnails'
  AND created_at < NOW() - INTERVAL '30 days';
```

---

## Supabase Setup

### 1. Run Storage Policy SQL

```bash
# In Supabase SQL Editor, run:
supabase-thumbnail-storage.sql
```

This creates policies for:
- ✅ Authenticated users can upload thumbnails
- ✅ Users can update their own thumbnails
- ✅ Users can delete their own thumbnails
- ✅ Public can view all thumbnails

### 2. Verify Bucket Exists

Check that `stream-recordings` bucket exists:
- Go to Supabase Dashboard → Storage
- Ensure `stream-recordings` is public

---

## Troubleshooting

### Thumbnail Not Appearing After 2 Minutes

**Check Console Logs:**
```
🎬 Auto-thumbnail scheduled for 2 minutes from now...
Capturing live stream thumbnail...
✅ Thumbnail captured and uploaded!
```

**Common Issues:**
1. **Browser blocking MediaRecorder API**
   - Check browser console for errors
   - Ensure HTTPS (or localhost)

2. **Supabase Storage permissions**
   - Run `supabase-thumbnail-storage.sql`
   - Check bucket is public

3. **Canvas not rendering video**
   - Video element must be playing
   - Video must have valid srcObject

### Thumbnail Shows Blank/Black Screen

**Causes:**
- Screen share not active when captured
- Video element paused or muted
- Browser tab in background (throttled rendering)

**Solution:**
- Keep browser tab active during first 2 minutes
- Ensure screen share is started immediately

### Storage Quota Exceeded

**Check Storage Usage:**
```sql
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(metadata->>'size'::bigint) / 1024 / 1024 as total_mb
FROM storage.objects
WHERE bucket_id = 'stream-recordings'
GROUP BY bucket_id;
```

**Cleanup Old Thumbnails:**
- Delete thumbnails from ended streams
- Implement auto-cleanup policy (see Manual Cleanup above)

---

## Future Enhancements

### Potential Features:

1. **Multiple Thumbnails**
   - Capture multiple clips throughout stream
   - Carousel of previews

2. **Thumbnail Selection**
   - Streamer chooses best moment
   - Manual thumbnail upload option

3. **GIF Alternative**
   - Convert to GIF for better browser compatibility
   - Smaller file sizes

4. **Sound on Hover**
   - Unmute video when hovering over card
   - Like Twitch previews

5. **Thumbnail Analytics**
   - Track which thumbnails get more clicks
   - A/B test different capture times

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| MediaRecorder API | ✅ | ✅ | ✅ (14.5+) | ✅ |
| WebM VP9 | ✅ | ✅ | ❌* | ✅ |
| Canvas captureStream | ✅ | ✅ | ✅ | ✅ |
| Autoplay muted video | ✅ | ✅ | ✅ | ✅ |

**Note:** Safari doesn't support VP9 codec. May need H.264 fallback.

---

## Performance Impact

### Resource Usage:

- **Capture Process**: ~5-10% CPU for 3 seconds
- **Upload**: ~1 second (depends on connection)
- **Playback**: Minimal (native video element)

### Optimization Tips:

1. Lower bitrate for slower connections
2. Reduce canvas resolution (720p → 480p)
3. Increase capture delay (2 min → 5 min)

---

## Summary

✅ **Automatic** - No streamer action needed  
✅ **Fast** - Only 3 seconds of video  
✅ **Engaging** - Animated previews attract more viewers  
✅ **Efficient** - Small file sizes (~900 KB)  
✅ **Smart** - Captures after 2 minutes (stable stream)

This feature significantly improves the user experience by showing what's actually happening in live streams, rather than static placeholders.

