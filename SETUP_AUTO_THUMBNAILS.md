# 🚀 Quick Setup: Auto-Thumbnail Feature

## ✅ What's Already Done

All code is committed and pushed to GitHub! Your Render deployment should auto-update.

---

## 📋 Setup Steps (5 minutes)

### Step 1: Run Supabase SQL

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select project: `hjhmgllhkppevwzocvtm`
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste contents of: `supabase-thumbnail-storage.sql`
6. Click **Run** (or press F5)

**Expected Output:**
```
DROP POLICY
CREATE POLICY
DROP POLICY
CREATE POLICY
DROP POLICY
CREATE POLICY
DROP POLICY
CREATE POLICY
```

---

### Step 2: Test Locally

```bash
# Start your local environment
npm run dev
```

1. Open http://localhost:3000
2. Click **"Go Live Now"**
3. Start streaming (camera or screen share)
4. Wait **2 minutes** ⏰
5. Check browser console for:
   ```
   🎬 Auto-thumbnail scheduled for 2 minutes from now...
   Capturing live stream thumbnail...
   ✅ Thumbnail captured and uploaded!
   ```

---

### Step 3: Verify Thumbnail

1. Go to **Discover** page or **Homepage**
2. Your live stream card should now show:
   - **Animated 3-second video clip** (instead of Nextwork logo)
   - Looping smoothly
   - Muted

3. Check Supabase Storage:
   - Go to **Storage** → `stream-recordings` bucket
   - Look in `thumbnails/` folder
   - You should see: `thumbnail_STREAMID_TIMESTAMP.webm`

---

## 🎯 How It Works

```
┌─────────────────────────────────────────────────────────┐
│ 1. User goes live                                       │
│    → Shows "Nextwork.org Classroom" placeholder         │
└─────────────────────────────────────────────────────────┘
                        ↓
                   Wait 2 minutes
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. System auto-captures                                 │
│    → Records 3-second video clip at 720p                │
│    → Uploads to Supabase Storage                        │
│    → Updates stream.thumbnail_url in database           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Thumbnail displays everywhere                        │
│    → Homepage "Live Now" section                        │
│    → Discover page (all live streams)                   │
│    → Any place showing stream cards                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Troubleshooting

### Thumbnail not appearing after 2 minutes?

**Check console logs:**
- Should see: `🎬 Auto-thumbnail scheduled...`
- Then: `Capturing live stream thumbnail...`
- Then: `✅ Thumbnail captured and uploaded!`

**If missing:**
1. Ensure you ran the SQL file in Supabase
2. Check browser permissions (camera/screen allowed)
3. Verify `stream-recordings` bucket exists
4. Check browser is Chrome/Firefox/Edge (Safari has limited support)

### Shows black screen in thumbnail?

**Causes:**
- Screen share wasn't active during capture
- Browser tab was in background (throttled)

**Solution:**
- Keep tab active for first 2 minutes
- Start screen share immediately when going live

### Storage quota exceeded?

**Check usage:**
```sql
SELECT 
  COUNT(*) as thumbnail_count,
  SUM(metadata->>'size'::bigint) / 1024 / 1024 as total_mb
FROM storage.objects
WHERE bucket_id = 'stream-recordings'
  AND (storage.foldername(name))[1] = 'thumbnails';
```

**Cleanup old thumbnails:**
```sql
DELETE FROM storage.objects
WHERE bucket_id = 'stream-recordings'
  AND (storage.foldername(name))[1] = 'thumbnails'
  AND created_at < NOW() - INTERVAL '30 days';
```

---

## 📊 File Sizes

- **3-second clip:** ~900 KB
- **100 live streams:** ~90 MB storage
- **Very efficient!** Much smaller than full recordings

---

## ⚙️ Configuration (Optional)

### Change capture delay (default: 2 minutes)

Edit `components/LiveKitGoLive.tsx`:
```typescript
thumbnailTimerRef.current = scheduleAutomaticThumbnailCapture(
    videoRef.current,
    streamId,
    5 // Change to 5 minutes, or any number
);
```

### Change clip duration (default: 3 seconds)

Edit `lib/thumbnail.ts`:
```typescript
const maxFrames = 30 * 5 // Change 5 to desired seconds (30fps)
```

### Change video quality (default: 2.5 Mbps)

Edit `lib/thumbnail.ts`:
```typescript
const recorder = new MediaRecorder(canvasStream, {
  mimeType: 'video/webm;codecs=vp9',
  videoBitsPerSecond: 5000000, // Change to 5 Mbps (higher quality)
})
```

---

## 🎉 That's It!

You now have **Twitch-style animated previews** on all your live streams!

**Benefits:**
- ✅ More engaging than static images
- ✅ Shows actual stream content
- ✅ Increases click-through rates
- ✅ Fully automatic
- ✅ Small file sizes

**Questions?** See full docs: `docs/AUTO_THUMBNAIL_CAPTURE.md`

