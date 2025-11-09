# 🌳 Vibe Coding Live - Complete Logic Tree

**Last Updated:** November 8, 2025  
**Project:** Live streaming platform for IT learners and educators

---

## 📊 HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICE                              │
│                     (Browser / Mobile)                           │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├─────────────────┬─────────────────┬──────────────────┐
             ▼                 ▼                 ▼                  ▼
    ┌────────────────┐  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐
    │   RENDER.COM   │  │  SUPABASE   │  │   LIVEKIT    │  │  EXTERNAL   │
    │   (App Host)   │  │  (Backend)  │  │  (Streaming) │  │   APIs      │
    └────────────────┘  └─────────────┘  └──────────────┘  └─────────────┘
           │                   │                 │                 │
           │                   │                 │                 │
    Next.js App          PostgreSQL DB      WebRTC Server    Twilio SMS
    Static Assets        Auth System        Video/Audio      Email APIs
    API Routes           Storage (CDN)      Real-time
```

---

## 🔄 COMPLETE USER FLOWS

### **Flow 1: User Sign Up & Authentication**

```
User Visits Site
    │
    ▼
[/auth/signup]
    │
    ├─► Fill Form (email, username, password, display_name)
    │
    ▼
Supabase Auth.signUp()
    │
    ├─► Creates user in auth.users table
    │
    ▼
Trigger: on_auth_user_created
    │
    ▼
Function: handle_new_user()
    │
    ├─► Inserts into profiles table
    │   ├─ id (from auth.users)
    │   ├─ username
    │   ├─ display_name
    │   ├─ avatar_url
    │   └─ initial_xp = 0
    │
    ▼
Auto-login & Redirect to /dashboard
```

### **Flow 2: Going Live (Streaming)**

```
User Clicks "Go Live Now"
    │
    ▼
[/stream/demo-live] OR [/stream/{id}]
    │
    ├─► Shows Stream Setup Form
    │   ├─ Title
    │   ├─ Description
    │   ├─ Category
    │   └─ Tags
    │
    ▼
User Clicks "Continue to Go Live"
    │
    ▼
LiveKitGoLive Component
    │
    ├─► Step 1: Create Stream Record
    │   │
    │   └─► API: /api/streams/livekit-start
    │       │
    │       └─► INSERT into streams table
    │           ├─ user_id
    │           ├─ title, description, category
    │           ├─ is_live = true
    │           ├─ playback_url = null
    │           └─ Returns: streamId
    │
    ├─► Step 2: Get LiveKit Token
    │   │
    │   └─► API: /api/livekit/token
    │       │
    │       └─► Generates JWT token for room access
    │
    ├─► Step 3: Join LiveKit Room
    │   │
    │   └─► Connect to: wss://videostreamv5-yz05w4m7.livekit.cloud
    │       ├─ Request camera/mic permissions
    │       ├─ Auto-enable camera (after 1s)
    │       └─ Auto-enable mic (after 1s)
    │
    ├─► Step 4: Start Recording
    │   │
    │   └─► RecordingManager Component
    │       ├─ Wait 2 seconds for tracks to be ready
    │       ├─ Check for BOTH audio AND video tracks
    │       ├─ Create MediaRecorder (WebM VP9 + Opus)
    │       ├─ Collect chunks every 1 second
    │       └─ Handles screen share switching
    │
    ├─► Step 5: 20-Second Mark - Capture Clips
    │   │
    │   └─► captureAllClips()
    │       ├─ Capture frozen thumbnail (image)
    │       ├─ Capture 30s preview video
    │       ├─ Capture 12s preview video
    │       │
    │       └─► API: /api/streams/capture-clips
    │           │
    │           └─► Upload to Supabase Storage
    │               ├─ stream-thumbnails/frozen/
    │               ├─ stream-thumbnails/30s/
    │               └─ stream-thumbnails/12s/
    │
    └─► Step 6: User Clicks "End Stream"
        │
        ├─► Stop MediaRecorder
        │   ├─ Wait for onstop handler
        │   ├─ Wait 1s for file finalization
        │   └─ Collect all chunks from ref
        │
        ├─► Upload Full Recording (Background)
        │   │
        │   └─► API: /api/streams/upload-recording
        │       ├─ Create Blob from chunks (~800MB/hour)
        │       ├─ Upload to: stream-recordings bucket
        │       ├─ Get public URL
        │       │
        │       └─► UPDATE streams SET
        │           ├─ playback_url = [Supabase URL]
        │           ├─ is_live = false
        │           └─ ended_at = NOW()
        │
        └─► API: /api/streams/livekit-end
            │
            └─► UPDATE streams SET
                ├─ is_live = false
                ├─ ended_at = NOW()
                └─ recently_live_until = NOW() + 30 min
```

### **Flow 3: Watching a Recording**

```
User Clicks Stream Card
    │
    ▼
[/stream/{id}]
    │
    ├─► Fetch Stream Data
    │   │
    │   └─► SELECT from streams
    │       ├─ id, title, description
    │       ├─ playback_url
    │       ├─ is_live
    │       └─ JOIN profiles (streamer info)
    │
    ├─► Check Stream Status
    │   │
    │   ├─► IF is_live = true
    │   │   └─► Show: "Stream is Live" (watch live)
    │   │
    │   ├─► IF ended_at EXISTS && playback_url IS NULL
    │   │   └─► Show: "Processing Recording..." screen
    │   │       ├─ Auto-check database every 5s
    │   │       ├─ Show elapsed time counter
    │   │       └─ Auto-refresh when playback_url appears
    │   │
    │   └─► IF playback_url EXISTS
    │       └─► Show: VideoPlayer Component
    │
    └─► VideoPlayer Renders
        │
        ├─► Check URL type
        │   ├─ YouTube? → Embed iframe
        │   ├─ .webm/.mp4? → Native <video> tag
        │   └─ .m3u8? → HLS.js player
        │
        └─► Load video from:
            https://hjhmgllhkppevwzocvtm.supabase.co/storage/v1/object/public/stream-recordings/[file].webm
            │
            └─► Delivered via Supabase CDN (AWS CloudFront)
```

### **Flow 4: Messaging System**

```
User Opens Messages Page
    │
    ▼
[/dashboard/messages]
    │
    ├─► Fetch All Users
    │   └─► SELECT id, username, display_name, avatar_url
    │       FROM profiles
    │       WHERE id != current_user
    │
    ├─► Fetch All Conversations
    │   └─► SELECT * FROM direct_messages
    │       WHERE sender_id = current_user OR recipient_id = current_user
    │       JOIN profiles (sender & recipient data)
    │
    ├─► Subscribe to Real-time Updates
    │   └─► Supabase Channel: 'direct-messages-realtime'
    │       └─► Listen for INSERTs where recipient_id = current_user
    │
    └─► User Sends Message
        │
        ├─► INSERT into direct_messages
        │   ├─ sender_id
        │   ├─ recipient_id
        │   └─ message
        │
        ├─► Immediately add to local state (instant UI update)
        │
        └─► Background sync after 100ms
```

### **Flow 5: Admin Dashboard - Mark Project Complete**

```
Admin Opens Dashboard
    │
    ▼
[/dashboard/admin]
    │
    ├─► Fetch Stats
    │   ├─ COUNT(*) from profiles → Total Users
    │   ├─ COUNT(*) from streams → Total Streams
    │   ├─ COUNT(*) from stream_likes → Total Likes
    │   └─ COUNT(*) from user_project_completions → Projects Completed
    │
    ├─► Fetch All Users (Paginated)
    │   └─► SELECT id, username, display_name, avatar_url
    │       FROM profiles
    │       LIMIT 10 (with Load More)
    │
    └─► Admin Selects User & Project
        │
        ├─► Search with 300ms debounce
        │
        ├─► Click user from dropdown
        │
        ├─► Select project from list
        │
        └─► Click "Mark Complete"
            │
            └─► INSERT into user_project_completions
                ├─ user_id
                ├─ project_id
                ├─ verified_by (admin id)
                ├─ notes
                │
                └─► Trigger: award_xp_on_project_completion
                    │
                    └─► UPDATE profiles
                        SET total_xp = total_xp + 20
                        WHERE id = user_id
```

---

## 🗄️ DATABASE SCHEMA RELATIONSHIPS

```
┌──────────────┐
│   auth.users │ (Supabase Auth - managed automatically)
└──────┬───────┘
       │ 1:1
       ▼
┌──────────────────────────────────────────────┐
│              profiles                        │
├──────────────────────────────────────────────┤
│ PK: id (UUID - references auth.users.id)    │
│ - username (unique)                          │
│ - display_name                               │
│ - avatar_url                                 │
│ - bio                                        │
│ - total_xp (default 0)                       │
│ - is_verified (default false)               │
│ - is_nextwork_admin (default false)         │
│ - created_at                                 │
└───────┬──────────────────────────────────────┘
        │
        │ 1:Many
        ▼
┌─────────────────────────────────────────────────────┐
│                   streams                            │
├─────────────────────────────────────────────────────┤
│ PK: id (UUID)                                       │
│ FK: user_id → profiles.id                           │
│ - title, description, category                      │
│ - stream_key                                        │
│ - playback_url (full recording)                     │
│ - thumbnail_url, video_30s_url, video_12s_url      │
│ - is_live (boolean)                                 │
│ - viewer_count                                      │
│ - source_type (youtube | live_event)                │
│ - started_at, ended_at, recently_live_until         │
│ - Indexes: is_live, user_id, created_at, category   │
└────┬────────────────────────────────────────────────┘
     │
     ├─────────────┬────────────────┬─────────────────┐
     │             │                │                 │
     ▼             ▼                ▼                 ▼
┌─────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐
│  likes  │  │   chat   │  │   views    │  │  moderators  │
├─────────┤  ├──────────┤  ├────────────┤  ├──────────────┤
│ user_id │  │ user_id  │  │ user_id    │  │ user_id      │
│stream_id│  │stream_id │  │ stream_id  │  │ stream_id    │
└─────────┘  │ message  │  │ ip_address │  └──────────────┘
             │ sent_at  │  │ duration   │
             └──────────┘  └────────────┘

┌──────────────────────────────────────────────┐
│          direct_messages                      │
├──────────────────────────────────────────────┤
│ PK: id                                       │
│ FK: sender_id → profiles.id                  │
│ FK: recipient_id → profiles.id               │
│ - message (text)                             │
│ - is_read (boolean)                          │
│ - created_at                                 │
│ Indexes: recipient_id, sender_id, is_read    │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│          followers                            │
├──────────────────────────────────────────────┤
│ PK: id                                       │
│ FK: follower_id → profiles.id                │
│ FK: following_id → profiles.id               │
│ - created_at                                 │
│ UNIQUE(follower_id, following_id)            │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│     user_project_completions                 │
├──────────────────────────────────────────────┤
│ PK: id                                       │
│ FK: user_id → profiles.id                    │
│ FK: project_id → nextwork_projects.id        │
│ FK: verified_by → profiles.id (admin)        │
│ - notes                                      │
│ - completed_at                               │
│ UNIQUE(user_id, project_id)                  │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│        nextwork_projects                     │
├──────────────────────────────────────────────┤
│ PK: id                                       │
│ - title                                      │
│ - description                                │
│ - difficulty (beginner/intermediate/advanced)│
│ - xp_reward (default 20)                     │
│ - is_active (boolean)                        │
└──────────────────────────────────────────────┘
```

---

## 🎥 VIDEO RECORDING & STORAGE FLOW

```
Live Stream Recording Process:
═══════════════════════════════

User's Browser (MediaRecorder)
    │
    │ Records: WebM VP9 + Opus codec
    │ Size: ~800 MB/hour (13.44 MB/min)
    │ Collects chunks every 1 second
    │
    ▼
On "End Stream" Click
    │
    ├─► Stop MediaRecorder
    ├─► Wait for onstop handler (finalization)
    ├─► Wait additional 1 second (metadata write)
    └─► Collect all chunks into single Blob
        │
        ▼
    Upload to API (Background)
        │
        └─► POST /api/streams/upload-recording
            ├─ FormData: file (Blob), streamId
            │
            ├─► Check Storage: cleanupOldRecordings()
            │   └─► If total > 100GB, delete oldest files
            │
            ├─► Upload to Supabase Storage
            │   └─► Bucket: stream-recordings
            │       ├─ File: {streamId}_{timestamp}.webm
            │       ├─ Max size: 2000 MB (2 GB)
            │       └─ Returns: public URL
            │
            └─► Update Database
                └─► UPDATE streams
                    SET playback_url = [Supabase URL]
                    WHERE id = streamId

Clip Capture (at 20-second mark):
══════════════════════════════

Timer fires after 20 seconds
    │
    └─► captureAllClips(stream, videoElement)
        │
        ├─► Capture 1: Frozen Thumbnail
        │   ├─ Canvas screenshot from video
        │   ├─ Convert to PNG (~100KB)
        │   └─> Upload to: stream-thumbnails/frozen/
        │
        ├─► Capture 2: 30s Preview
        │   ├─ Record 30 seconds of video
        │   ├─ Size: ~3.5 MB
        │   └─> Upload to: stream-thumbnails/30s/
        │
        └─► Capture 3: 12s Preview
            ├─ Record 12 seconds of video
            ├─ Size: ~1.5 MB
            └─> Upload to: stream-thumbnails/12s/
            │
            └─► API: /api/streams/capture-clips
                │
                └─► UPDATE streams SET
                    ├─ thumbnail_url = [frozen URL]
                    ├─ video_30s_url = [30s URL]
                    └─ video_12s_url = [12s URL]
```

---

## 🌐 API ENDPOINTS MAP

### **Authentication APIs**
```
POST /api/auth/signup     → Create new user account
POST /api/auth/login      → Authenticate user
POST /api/auth/logout     → End user session
GET  /api/auth/session    → Get current session
```

### **Stream Management APIs**
```
POST /api/streams/livekit-start      → Create stream record, return streamId
POST /api/streams/livekit-end        → Mark stream as ended
POST /api/streams/upload-recording   → Upload full recording to storage
POST /api/streams/capture-clips      → Upload thumbnail/preview clips
POST /api/streams/create             → Alternative stream creation
GET  /api/streams/latest             → Get most recent live stream
GET  /api/streams/check-live         → Check for new live streams (notifications)
```

### **LiveKit APIs**
```
GET /api/livekit/token               → Generate LiveKit room access token
    Input: room, name
    Output: JWT token
```

### **Admin APIs**
```
GET  /api/admin/settings             → Get current app settings
POST /api/admin/settings             → Update app settings
GET  /api/admin/resources/stats      → Get resource usage statistics
GET  /api/admin/resources/distribution → Get stream distribution data
```

### **Expert Help APIs**
```
POST /api/expert/notify              → Send SMS/Email to Nextwork experts
GET  /api/expert/help-requests       → Check for pending help requests
```

---

## 📱 PAGE STRUCTURE & ROUTES

```
/                                    → Homepage
├─ Hero Section
├─ Live Streams (if any)
└─ Recorded Sessions (6 initially, Load More)

/discover                            → Browse Live Streams
├─ Category filters
├─ Search bar
└─ Live stream cards (auto-refresh)

/recordings                          → All Recorded Streams
└─ Full catalog of recordings

/stream/demo-live                    → Go Live Page
└─ Stream setup form → LiveKit room

/stream/{id}                         → Individual Stream Page
├─ IF is_live → Show live player
├─ IF ended && no playback_url → "Processing Recording..."
└─ IF playback_url → Video player

/dashboard                           → User Dashboard
├─ My streams
├─ Stats (XP, level, projects)
└─ Quick actions

/dashboard/admin                     → Admin Dashboard
├─ Platform stats
├─ Mark project complete (10 users, Load More)
├─ Recent completions
└─ Top streamers

/dashboard/messages                  → Direct Messages
├─ User list (searchable)
├─ Recent conversations
└─ Chat interface (real-time)

/admin/settings                      → Platform Settings
├─ Thumbnail mode selector
├─ Cost comparison table
├─ Stream distribution
├─ Resource monitor (manual refresh)
└─ Cost reference chart

/auth/login                          → Login Page
/auth/signup                         → Registration Page
```

---

## 🔐 ROW LEVEL SECURITY (RLS) POLICIES

```
PROFILES TABLE:
├─ SELECT: Anyone can view profiles (USING true)
├─ INSERT: Users can insert their own (WITH CHECK auth.uid() = id)
└─ UPDATE: Users can update their own (USING auth.uid() = id)

STREAMS TABLE:
├─ SELECT: Anyone can view streams (USING true)
├─ INSERT: Authenticated users can create (WITH CHECK auth.uid() IS NOT NULL)
├─ UPDATE: Owner can update their own (USING auth.uid() = user_id)
└─ DELETE: Owner can delete their own (USING auth.uid() = user_id)

DIRECT_MESSAGES TABLE:
├─ SELECT: Can view if sender or recipient (USING auth.uid() IN (sender_id, recipient_id))
├─ INSERT: Authenticated users can send (WITH CHECK auth.uid() = sender_id)
└─ UPDATE: Recipient can mark as read (USING auth.uid() = recipient_id)

NEXTWORK_PROJECTS TABLE:
├─ SELECT: Anyone can view (USING true)
└─ INSERT/UPDATE/DELETE: Only Nextwork admins (WHERE is_nextwork_admin = true)

USER_PROJECT_COMPLETIONS TABLE:
├─ SELECT: Anyone can view (USING true)
├─ INSERT: Only admins can mark complete (WHERE is_nextwork_admin = true)
└─ DELETE: Only admins can remove (WHERE is_nextwork_admin = true)
```

---

## 🎨 COMPONENT HIERARCHY

```
App Root
│
├─ Navigation (on every page)
│  ├─ Logo
│  ├─ Home, Discover, Dashboard links
│  └─ User menu (if logged in) / Sign In button
│
├─ Page Components
│  │
│  ├─ HomePage
│  │  ├─ Hero Section
│  │  ├─ Live Streams Section
│  │  │  └─ StreamCard (x N)
│  │  └─ Recorded Sessions
│  │     ├─ Filters & Sorting
│  │     ├─ StreamCard (x 6 initially)
│  │     └─ Load More Button
│  │
│  ├─ DiscoverPage
│  │  ├─ Search Bar
│  │  ├─ Category Filters
│  │  └─ StreamCard (x N live streams)
│  │
│  ├─ StreamPage
│  │  ├─ VideoPlayer OR LiveKitGoLive
│  │  ├─ Stream Info
│  │  ├─ ChatBox (real-time)
│  │  └─ Expert Help Dropdown
│  │
│  ├─ DashboardPage
│  │  ├─ User stats & level badge
│  │  ├─ My streams list
│  │  └─ Admin link (if admin)
│  │
│  ├─ AdminDashboardPage
│  │  ├─ Stats cards (users, streams, likes, projects)
│  │  ├─ Mark Project Complete
│  │  │  ├─ User search (debounced, paginated)
│  │  │  └─ Project dropdown
│  │  ├─ Recent Completions
│  │  └─ Top Streamers
│  │
│  ├─ AdminSettingsPage
│  │  ├─ ThumbnailModeSelector
│  │  ├─ CostComparisonTable
│  │  ├─ StreamDistribution
│  │  ├─ ResourceMonitor (manual refresh)
│  │  └─ CostReferenceChart
│  │
│  └─ MessagesPage
│     ├─ User selection sidebar (searchable)
│     ├─ Chat area
│     │  ├─ Message bubbles (with sender names)
│     │  └─ Real-time subscriptions
│     └─ Message input
│
├─ Shared Components
│  │
│  ├─ StreamCard
│  │  ├─ Thumbnail (frozen/hover/12s/30s based on mode)
│  │  ├─ Title, category, views
│  │  ├─ Streamer info
│  │  └─ LIVE/RECORDED badge
│  │
│  ├─ VideoPlayer
│  │  ├─ YouTube iframe (if YouTube URL)
│  │  ├─ Native <video> (if .webm/.mp4)
│  │  └─ HLS.js player (if .m3u8)
│  │
│  ├─ LiveKitGoLive
│  │  ├─ Stream setup form
│  │  ├─ LiveKitRoom connection
│  │  ├─ RecordingManager
│  │  ├─ CustomVideoDisplay (with zoom)
│  │  └─ LiveKitControls (camera, mic, screen share)
│  │
│  ├─ ChatBox
│  │  ├─ Message list
│  │  ├─ Real-time subscription
│  │  └─ Message input
│  │
│  ├─ ExpertHelpNotification
│  │  └─ Toast notifications for expert requests
│  │
│  ├─ LiveStreamNotification
│  │  └─ Toast when new stream goes live
│  │
│  └─ UserLevelBadge
│     └─ Shows user level based on XP
│
└─ Utility Components
   ├─ Navigation
   ├─ BackButton
   └─ TestNotificationButton
```

---

## 🔄 REAL-TIME SUBSCRIPTIONS

```
Supabase Realtime Channels:
═══════════════════════════

1. Stream Chat
   ├─ Channel: 'chat-{streamId}'
   ├─ Table: chat_messages
   ├─ Event: INSERT
   └─ Filter: stream_id = {streamId}

2. Direct Messages
   ├─ Channel: 'direct-messages-realtime'
   ├─ Table: direct_messages
   ├─ Event: INSERT
   └─ Filter: recipient_id = current_user

3. Expert Help Requests
   ├─ Channel: 'expert-help-requests'
   ├─ Table: direct_messages
   ├─ Event: INSERT
   └─ Filter: Nextwork admin users
```

---

## 💾 STORAGE BUCKETS

```
Supabase Storage Organization:
══════════════════════════════

stream-recordings/              (Public)
├─ Size Limit: 2000 MB per file
├─ Total Quota: 100 GB (Supabase Pro)
├─ File Format: .webm
├─ Naming: {streamId}_{timestamp}.webm
├─ Average Size: ~800 MB/hour
└─ Auto-cleanup: Deletes oldest when approaching 100GB

stream-thumbnails/              (Public)
├─ frozen/
│  ├─ Format: PNG
│  └─ Size: ~100 KB each
├─ 30s/
│  ├─ Format: WebM
│  └─ Size: ~3.5 MB each
└─ 12s/
   ├─ Format: WebM
   └─ Size: ~1.5 MB each

CDN Delivery:
├─ URL Pattern: https://hjhmgllhkppevwzocvtm.supabase.co/storage/v1/object/public/...
├─ Backend: AWS S3 + CloudFront
├─ Caching: Automatic edge caching
└─ Global: Worldwide CDN distribution
```

---

## ⚡ PERFORMANCE OPTIMIZATIONS

```
Database Indexes (Applied):
══════════════════════════

streams table:
├─ idx_streams_is_live (is_live)
├─ idx_streams_user_id (user_id)
├─ idx_streams_created_at (created_at DESC)
├─ idx_streams_viewer_count (viewer_count DESC)
├─ idx_streams_category (category)
└─ idx_streams_source_type (source_type)

direct_messages table:
├─ idx_direct_messages_recipient (recipient_id, created_at DESC)
├─ idx_direct_messages_sender (sender_id, created_at DESC)
└─ idx_direct_messages_unread (recipient_id, is_read, created_at DESC)

profiles table:
├─ idx_profiles_username (username)
└─ idx_profiles_display_name (display_name)

Other tables:
├─ stream_likes: (user_id, stream_id), (stream_id)
├─ followers: (follower_id, following_id), (following_id)
└─ stream_views: (stream_id, user_id)

Pagination:
═══════════
├─ Admin user dropdown: 10 users, Load More +10
├─ Homepage streams: 6 streams, Load More +6
└─ Discover page: All live streams (typically <10)

Search Debouncing:
═════════════════
└─ Admin user search: 300ms delay after typing

Query Optimization:
══════════════════
├─ Homepage: SELECT specific 11-12 columns (not *)
├─ Admin: SELECT specific 4 columns (not *)
└─ Impact: 20-30% less data transferred
```

---

## 🎯 USER EXPERIENCE LAYER (UX)

```
Thumbnail Display Modes (Admin Configurable):
════════════════════════════════════════════

Mode 1: Frozen (Static Images)
├─ Shows: thumbnail_url (PNG image)
├─ Storage: Minimal (~100KB per stream)
├─ Bandwidth: Minimal
└─ Cost: $0.00/month

Mode 2: Hover Only
├─ Shows: thumbnail_url initially
├─ On Hover: Loads video_30s_url
├─ Storage: ~1.1 MB per live stream
├─ Bandwidth: Only loads on hover
└─ Cost: $0.00/month

Mode 3: 12s Auto-play
├─ Shows: video_12s_url (auto-plays)
├─ Storage: ~1.5 MB per live stream
├─ Bandwidth: ~8 GB/day (100 streams, 10 views each)
└─ Cost: ~$0.54/month

Mode 4: 30s Auto-play
├─ Shows: video_30s_url (auto-plays)
├─ Storage: ~3.5 MB per live stream
├─ Bandwidth: ~18 GB/day (100 streams, 10 views each)
└─ Cost: ~$1.44/month

Note: YouTube streams always use static thumbnails (minimal cost)
```

---

## 🔔 NOTIFICATION SYSTEM

```
Expert Help Request Flow:
════════════════════════

User clicks "Alert Staff of Question"
    │
    ├─► Play sound (2x, 4x, or 6x beeps based on urgency)
    │
    ├─► Query profiles for @nextwork.org emails
    │
    ├─► INSERT into direct_messages (to all staff)
    │   ├─ Message includes urgency level
    │   └─ Stream URL for context
    │
    ├─► POST /api/expert/notify
    │   ├─ Send SMS via Twilio
    │   └─ Send Email
    │
    ├─► Dispatch CustomEvent: 'expertHelpRequest'
    │   └─ Triggers ExpertHelpNotification component
    │
    └─► Show Toast Notification
        ├─ Success: "✅ Staff members have been notified!"
        ├─ Warning: "⚠️ No admin staff available"
        └─ Auto-dismiss after 5 seconds

Toast Notification Rendering:
═══════════════════════════
Position: fixed, top-32 (128px), right-6
Animation: slideInRight (from right edge)
Auto-dismiss: 5 seconds
Colors:
├─ Success: Green gradient
├─ Error: Red gradient
└─ Warning: Yellow/orange gradient
```

---

## 🎮 STATE MANAGEMENT

```
Client-Side State:
═════════════════

Authentication (useAuth hook):
├─ user (Supabase auth user object)
├─ profile (from profiles table)
└─ Auto-syncs with Supabase session

Local Component State:
├─ LiveKitGoLive:
│  ├─ token, joined, streamId
│  ├─ mediaRecorder, recordedChunks
│  └─ zoom, position (for screen share)
│
├─ MessagesPage:
│  ├─ conversations (Map<userId, messages[]>)
│  ├─ selectedUser
│  └─ Real-time sync via Supabase
│
└─ AdminDashboard:
   ├─ totalUsers, totalStreams, totalLikes
   ├─ allUsers (paginated to 10)
   └─ Manual refresh only (no auto-polling)

No Global State Manager:
├─ Uses React useState and useEffect
├─ Supabase handles data persistence
└─ Real-time subscriptions for live updates
```

---

## 💰 COST BREAKDOWN

```
Monthly Costs:
═════════════

Supabase Pro: $25/month (Base)
├─ 100 GB storage (included)
├─ 250 GB bandwidth/month (included)
├─ 8 GB database (included)
└─ Overage costs:
   ├─ Storage: $0.021/GB/month
   └─ Bandwidth: $0.09/GB

Render.com: ~$7/month
├─ Web service hosting
└─ Automatic deployments from GitHub

LiveKit Cloud: Free Tier
├─ 10,000 participant minutes/month
└─ After that: Pay-as-you-go

SMS/Email (Twilio): Pay-per-use
├─ Only when expert help requested
└─ Minimal usage

Total Base Cost: ~$32/month
Projected Actual: ~$35-40/month (with normal usage)

Current Usage (Nov 8, 2025):
═══════════════════════════
├─ Storage: 0.4 GB / 100 GB (0.4%)
├─ Streams: 127 total (13 YouTube, 114 live events)
├─ Users: 29
├─ Daily recording: ~200 MB
└─ Projected monthly: ~6 GB (6% of limit)
```

---

## 🔢 KEY PERFORMANCE METRICS

```
Video Recording:
═══════════════
├─ Format: WebM VP9 + Opus
├─ Bitrate: ~13.44 MB/minute
├─ Size: ~800 MB/hour (0.8 GB/hr)
├─ 100 GB holds: ~125 hours of video
└─ Cost per hour (if over 100GB): $0.017

Database Query Performance (with indexes):
═════════════════════════════════════════
├─ Stream lookup by ID: <10ms
├─ Get live streams: <50ms
├─ User profile fetch: <20ms
├─ Message history: <30ms
└─ Admin dashboard stats: <100ms

Page Load Times (optimized):
═══════════════════════════
├─ Homepage: ~500ms (6 streams initially)
├─ Discover: ~300ms (live streams only)
├─ Admin Dashboard: ~400ms (10 users initially)
└─ Messages: ~350ms

Upload Performance:
══════════════════
├─ 30-second video (~6.5 MB): ~2-5 seconds
├─ 5-minute video (~67 MB): ~15-30 seconds
├─ 28-minute video (~373 MB): ~2-5 minutes
└─ Depends on user's upload speed
```

---

## 🛡️ SECURITY & AUTHENTICATION

```
Authentication Flow:
═══════════════════

Supabase Auth (JWT-based)
    │
    ├─► Sign Up
    │   ├─ Creates user in auth.users
    │   ├─ Trigger creates profile in profiles table
    │   └─ Returns session token
    │
    ├─► Login
    │   ├─ Validates credentials
    │   ├─ Creates session
    │   └─ Returns JWT token (stored in cookie)
    │
    └─► Session Management
        ├─ Token stored in httpOnly cookie
        ├─ Auto-refresh before expiration
        └─ useAuth hook checks session on every page

Protected Routes:
════════════════
├─ /dashboard/* → Requires authentication
├─ /admin/* → Requires is_nextwork_admin = true
├─ /stream/{id} → Public view, auth for interactions
└─ Client-side: useAuth() redirect to /auth/login

API Security:
════════════
├─ All API routes validate Supabase session
├─ Service role key used for admin operations
├─ RLS policies enforce data access rules
└─ CORS configured for localhost + render.com
```

---

## 🎬 VIDEO PROCESSING PIPELINE

```
Recording Lifecycle:
══════════════════

1. LIVE CAPTURE
   ├─ Browser MediaRecorder API
   ├─ Codec: VP9 (video) + Opus (audio)
   ├─ Container: WebM
   └─ Chunk collection every 1 second

2. FINALIZATION
   ├─ Stop MediaRecorder
   ├─ Wait for onstop handler
   ├─ Wait 1s for metadata write
   └─ Combine chunks into Blob

3. UPLOAD
   ├─ Background upload (non-blocking UI)
   ├─ POST to /api/streams/upload-recording
   ├─ Check if cleanup needed (>100GB)
   └─ Upload to Supabase Storage

4. STORAGE
   ├─ File saved in stream-recordings bucket
   ├─ Public URL generated
   └─ Database updated with playback_url

5. DELIVERY
   ├─ User requests video
   ├─ Supabase Storage serves file
   ├─ AWS CloudFront CDN caches globally
   └─ Browser plays via <video> tag

Thumbnail Processing (Parallel):
═══════════════════════════════
At 20-second mark:
├─ Frozen: Canvas screenshot → PNG
├─ 30s clip: MediaRecorder 30s → WebM
└─ 12s clip: MediaRecorder 12s → WebM
    │
    └─► All upload to stream-thumbnails bucket
```

---

## 📱 RESPONSIVE DESIGN BREAKPOINTS

```
Tailwind CSS Breakpoints:
════════════════════════

Mobile (default)
├─ <640px
├─ Single column layouts
└─ Stacked navigation

Tablet (sm)
├─ ≥640px
├─ 2-column stream grid
└─ Horizontal button groups

Desktop (lg)
├─ ≥1024px
├─ 3-4 column stream grid
├─ Sidebar layouts (messages, admin)
└─ Side-by-side video + chat

Large Desktop (xl)
├─ ≥1280px
├─ 4-column stream grid
└─ Maximum content width: 1920px
```

---

## 🔧 DEVELOPMENT & DEPLOYMENT

```
Local Development:
═════════════════

$ npm run dev
    │
    ├─► Next.js dev server: localhost:3000
    ├─► LiveKit: wss://videostreamv5-yz05w4m7.livekit.cloud
    └─► Supabase: hjhmgllhkppevwzocvtm.supabase.co

Environment Variables (.env.local):
├─ NEXT_PUBLIC_SUPABASE_URL
├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
├─ SUPABASE_SERVICE_ROLE_KEY
├─ LIVEKIT_API_KEY
├─ LIVEKIT_API_SECRET
├─ LIVEKIT_URL
└─ TWILIO_* (for SMS notifications)

Git Workflow:
════════════

Local Changes
    │
    ├─► git add -A
    ├─► git commit -m "message"
    └─► git push origin main
        │
        ▼
    GitHub Repository
        │
        └─► Webhook triggers Render.com
            │
            ▼
        Render.com Auto-Deploy
            ├─ Pulls latest code
            ├─ npm install
            ├─ npm run build
            └─ Deploys to: vibe-live-streaming.onrender.com

Backup & Restore Points:
═══════════════════════
├─ Tag: v1.0-stable (Nov 8, 2025)
├─ Branch: backup-stable-nov-8-2025
└─ To restore: git checkout v1.0-stable
```

---

## 🎯 DATA FLOW SUMMARY

```
                    ┌─────────────────────┐
                    │   USER BROWSER      │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌──────────────────┐    ┌──────────────┐
│  RENDER.COM   │    │   SUPABASE       │    │  LIVEKIT     │
│               │    │                  │    │              │
│  Next.js App  │◄───┤  PostgreSQL DB   │    │  WebRTC      │
│  API Routes   │───►│  Storage (CDN)   │    │  Streaming   │
│               │    │  Auth System     │    │              │
└───────────────┘    │  Realtime Sub.   │    └──────────────┘
                     └──────────────────┘
                               │
                               ▼
                     ┌──────────────────┐
                     │   AWS SERVICES   │
                     │  (via Supabase)  │
                     │                  │
                     │  S3 Storage      │
                     │  CloudFront CDN  │
                     └──────────────────┘
```

---

## 📋 CURRENT TECH STACK

```
Frontend:
├─ Next.js 14 (React 18)
├─ TypeScript
├─ Tailwind CSS
├─ Lucide Icons
└─ LiveKit Components React

Backend Services:
├─ Supabase (BaaS)
│  ├─ PostgreSQL Database
│  ├─ Authentication (JWT)
│  ├─ Storage (S3 + CDN)
│  └─ Realtime (WebSocket)
├─ LiveKit Cloud (WebRTC)
└─ Render.com (Hosting)

Media:
├─ MediaRecorder API (browser)
├─ WebM VP9 codec (video)
├─ Opus codec (audio)
└─ Canvas API (thumbnails)

External APIs:
├─ Twilio (SMS)
├─ Email service
└─ YouTube (embedded videos)
```

---

## 🚀 FUTURE OPTIMIZATION OPPORTUNITIES

```
Not Yet Implemented:
═══════════════════

High Impact:
├─ React Query for caching
├─ Image optimization (WebP format)
├─ Server-side rendering for static pages
└─ Database connection pooling

Medium Impact:
├─ Service worker for offline support
├─ Video transcoding to HLS format
├─ Redis cache layer
└─ Lazy loading for images

Low Priority:
├─ Separate CloudFront distribution
├─ GraphQL instead of REST
└─ Progressive Web App (PWA)
```

---

## 📊 MONITORING & ANALYTICS

```
Current Monitoring:
══════════════════

Admin Dashboard:
├─ Total users, streams, likes, projects
├─ Storage usage (manual refresh)
├─ Bandwidth estimates
└─ Cost projections

Resource Monitor:
├─ Stream counts (YouTube vs Live)
├─ Storage breakdown by type
├─ Current thumbnail mode
└─ Estimated monthly cost

Stream Distribution:
├─ Source type breakdown
├─ Page distribution (Discover, Homepage, Recordings)
└─ Top categories

Browser Console Logging:
├─ Upload progress and status
├─ Recording metadata
├─ Track availability
└─ Error messages

No Analytics Tools Yet:
├─ No Google Analytics
├─ No Mixpanel
├─ No Sentry error tracking
└─ No performance monitoring APM
```

---

## 🎓 LEARNING FEATURES

```
User Progression System:
═══════════════════════

XP (Experience Points):
├─ Starts at 0
├─ +20 XP per project completion
└─ Stored in profiles.total_xp

Level Calculation:
├─ Level 1: 0-99 XP
├─ Level 2: 100-199 XP
├─ Level 3: 200-299 XP
└─ Level N: (N-1) * 100 to N * 100 - 1

Project Completion:
├─ Admin marks user project complete
├─ Automatic XP award via database trigger
├─ Tracked in user_project_completions table
└─ Shows on user badge and profile

Nextwork Integration:
════════════════════
├─ 11 Nextwork instructor videos (from nextwork-streams.sql)
├─ Instructors: Natasha (3), Maya (3), Maximus (3), Haku (2)
├─ Real YouTube thumbnails
└─ Educational content mixed with user streams
```

---

**End of Logic Tree** 🌳

**To Understand Any Section Deeper:**
- Check the corresponding source code files
- Run SQL queries in Supabase to see actual data
- Use browser DevTools to trace execution
- Refer to component-specific documentation

**Key Files for Reference:**
- `components/LiveKitGoLive.tsx` - Streaming logic
- `app/stream/[id]/page.tsx` - Stream viewing logic
- `lib/supabase.ts` - Database client setup
- `supabase-schema.sql` - Database structure
- `supabase-performance-indexes.sql` - Query optimization

