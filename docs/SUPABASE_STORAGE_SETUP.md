# Supabase Storage Setup for Video Recordings

## 📦 Create Storage Bucket

**Go to:** https://supabase.com/dashboard/project/hjhmgllhkppevwzocvtm/storage/buckets

**Create a new bucket:**

1. Click **"New bucket"**
2. **Name:** `stream-recordings`
3. **Public bucket:** ✅ YES (so videos can be played publicly)
4. **File size limit:** 500 MB (per file)
5. **Allowed MIME types:** `video/webm, video/mp4`
6. Click **"Create bucket"**

---

## 🔐 Storage Policies

After creating the bucket, set up these policies:

### Policy 1: Public Read Access (Anyone can view recordings)

```sql
CREATE POLICY "Public read access for recordings"
ON storage.objects FOR SELECT
USING (bucket_id = 'stream-recordings');
```

### Policy 2: Authenticated Upload (Only logged-in users can upload)

```sql
CREATE POLICY "Authenticated users can upload recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stream-recordings' 
  AND auth.role() = 'authenticated'
);
```

### Policy 3: Service Role Delete (API can delete old files)

```sql
CREATE POLICY "Service role can delete recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'stream-recordings' 
  AND auth.role() = 'service_role'
);
```

---

## ⚙️ Apply Policies in Supabase

1. Go to **SQL Editor**: https://supabase.com/dashboard/project/hjhmgllhkppevwzocvtm/sql/new
2. Copy all 3 policies above
3. Paste and click **"Run"**

---

## 📊 Storage Configuration

**Bucket Settings:**
- **Name:** `stream-recordings`
- **Public:** Yes (for playback)
- **Max file size:** 500 MB per file
- **Total limit:** 5 GB (enforced by our cleanup logic)
- **Auto-cleanup:** Deletes oldest recordings when limit is reached

**File Format:**
- **Extension:** `.webm`
- **MIME type:** `video/webm`
- **Naming:** `{streamId}_{timestamp}.webm`

---

## 🧹 Automatic Cleanup

**How it works:**
1. Before uploading a new recording, check total storage used
2. If `current + new file > 5GB`, delete oldest recordings
3. Delete files until there's enough space
4. Then upload the new recording

**Priority:** Oldest files deleted first (FIFO - First In, First Out)

**Database updates:**
- When a file is deleted, the stream's `playback_url` is set to `null`
- Stream metadata stays in database (title, description, etc.)
- Just the video file is removed

---

## 🚀 Quick Setup Commands

Run this in Supabase SQL Editor to create everything:

```sql
-- Create the storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('stream-recordings', 'stream-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Public read
CREATE POLICY IF NOT EXISTS "Public read access for recordings"
ON storage.objects FOR SELECT
USING (bucket_id = 'stream-recordings');

-- Policy 2: Authenticated upload
CREATE POLICY IF NOT EXISTS "Authenticated users can upload recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stream-recordings' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Service role delete
CREATE POLICY IF NOT EXISTS "Service role can delete recordings"
ON storage.objects FOR DELETE
USING (bucket_id = 'stream-recordings');
```

---

## ✅ Verification

After setup, verify:
1. Go to **Storage** → **stream-recordings** bucket
2. Bucket should be **Public**
3. Policies should show 3 entries
4. Try uploading a test file to verify it works

---

**Status:** Ready to implement recording functionality!

