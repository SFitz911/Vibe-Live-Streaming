# 💻 Local Development Guide

**Complete guide for running Vibe Coding Live on your local machine**

**Audience:** Developers who want to customize, test, or contribute  
**Time:** 1-2 hours (first time)  
**Difficulty:** Intermediate

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Decision Tree](#decision-tree)
4. [Quick Start](#quick-start)
5. [Detailed Setup](#detailed-setup)
6. [Development Workflow](#development-workflow)
7. [Testing](#testing)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What is Local Development?

Running the app on your computer (`localhost:3000`) instead of a live website.

**Benefits:**
- ✅ Test changes instantly
- ✅ No risk of breaking live site
- ✅ Work offline
- ✅ Free (no hosting costs)
- ✅ Full control

**Requirements:**
- Computer with 8GB+ RAM
- Windows 10/11, Mac, or Linux
- Internet connection (for initial setup)
- ~2GB free disk space

---

## 🌳 Decision Tree

```
Do you have Node.js, Git, Docker installed?
    |
    ├─ YES → Jump to Quick Start
    |
    └─ NO → Follow Detailed Setup
        |
        └─ Never installed before?
            ├─ YES → Read GETTING_STARTED_COMPLETE_BEGINNER.md first
            └─ NO → Continue with Detailed Setup below
```

---

## ⚡ Quick Start

**For developers who have everything installed:**

```bash
# Clone repository
git clone https://github.com/SFitz911/Vibe-Live-Streaming.git
cd Vibe-Live-Streaming

# Install dependencies
npm install

# Copy environment template
cp env.example .env.local

# Edit .env.local with your Supabase credentials
# (Get from: https://supabase.com/dashboard → Your Project → Settings → API)

# Start Docker Desktop (if not running)
# Then start development server
npm run dev

# Open browser to http://localhost:3000
```

**Set up database:**
1. Run `supabase-schema.sql` in Supabase SQL Editor
2. Run `setup-all-data.sql` in Supabase SQL Editor
3. Run storage setup SQL from `SUPABASE_STORAGE_SETUP.md`

**Done!** 🎉

---

## 📚 Detailed Setup

### Step 1: Install Prerequisites

**1.1 Node.js** (JavaScript runtime)
- Download: https://nodejs.org
- Choose: LTS version (left button)
- Install with default settings
- Verify: `node --version` should show v18 or higher

**1.2 npm** (Package manager - comes with Node.js)
- Automatically installed with Node.js
- Verify: `npm --version` should show 9.0 or higher

**1.3 Git** (Version control)
- Download: https://git-scm.com
- Install with default settings
- Verify: `git --version`

**1.4 Docker Desktop** (Container platform)
- Download: https://www.docker.com/products/docker-desktop
- Install and restart computer
- Open Docker Desktop
- Wait for it to finish starting (whale icon turns green)
- Verify: `docker --version`

**1.5 Code Editor** (Optional but recommended)
- VS Code: https://code.visualstudio.com
- Or use any text editor you prefer

---

### Step 2: Clone the Repository

**What is cloning?**
Downloading the entire codebase from GitHub to your computer.

```bash
# Navigate to where you want the project
cd Desktop

# Clone the repository
git clone https://github.com/SFitz911/Vibe-Live-Streaming.git

# Enter the project folder
cd Vibe-Live-Streaming

# You should now be in: C:\Users\YourName\Desktop\Vibe-Live-Streaming
```

---

### Step 3: Install Project Dependencies

**What are dependencies?**
External libraries and packages that the project needs (React, Next.js, Supabase SDK, etc.)

```bash
npm install
```

**This will:**
- Download ~588 packages
- Create a `node_modules` folder
- Take 2-5 minutes

**When done, you'll see:**
```
added 588 packages in 3m
12 low severity vulnerabilities
```

**The vulnerabilities are OK** - they're in development dependencies and don't affect production.

---

### Step 4: Set Up Environment Variables

**What are environment variables?**
Configuration values that change between environments (local vs production). Think: Database passwords, API keys, etc.

**4.1 Copy the Template**

**Windows PowerShell:**
```powershell
Copy-Item env.example .env.local
```

**Mac/Linux:**
```bash
cp env.example .env.local
```

**4.2 Get Your Supabase Credentials**

1. Go to: https://supabase.com
2. Log in
3. Create a new project (or use existing)
4. Go to: **Settings** → **API**
5. Copy these values:
   - **URL:** Under "Project URL"
   - **anon public:** Under "Project API keys"
   - **service_role:** Under "Project API keys" (click "Reveal" first)

**4.3 Edit .env.local**

1. Open `.env.local` in your code editor
2. Replace these placeholders:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

3. **Save the file** (Ctrl + S)

**⚠️ NEVER commit .env.local to Git!** (It's already in .gitignore)

---

### Step 5: Set Up Supabase Database

**5.1 Create Database Schema**

1. Go to Supabase → **SQL Editor**
2. Click **"New query"**
3. In your code editor, open `supabase-schema.sql`
4. Copy ALL the contents (Ctrl + A, Ctrl + C)
5. Paste in Supabase SQL Editor (Ctrl + V)
6. Click green **"Run"** button

**You should see:** "Success. No rows returned"

**What this did:** Created all database tables (profiles, streams, chat_messages, etc.)

**5.2 Add Test Data**

1. In Supabase SQL Editor, click **"New query"**
2. In code editor, open `setup-all-data.sql`
3. Copy ALL contents
4. Paste in Supabase SQL Editor
5. Click **"Run"**

**You should see:** "Setup complete! ✅ Live streams for Discover, Recorded for Homepage"

**What this did:** Added 4 test users (Natasha, Maya, Maximus, Haku) and 16 test streams.

**5.3 Set Up Storage Bucket**

1. In Supabase SQL Editor, click **"New query"**
2. Copy this SQL:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('stream-recordings', 'stream-recordings', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access for recordings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload recordings" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete recordings" ON storage.objects;

CREATE POLICY "Public read access for recordings"
ON storage.objects FOR SELECT
USING (bucket_id = 'stream-recordings');

CREATE POLICY "Authenticated users can upload recordings"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'stream-recordings' AND auth.role() = 'authenticated');

CREATE POLICY "Service role can delete recordings"
ON storage.objects FOR DELETE
USING (bucket_id = 'stream-recordings');
```

3. Paste and click **"Run"**

**You should see:** "Success. No rows returned"

**What this did:** Created a storage bucket for saving video recordings.

---

### Step 6: Start Docker Desktop

**LiveKit (streaming server) runs in Docker:**

1. Open **Docker Desktop** application
2. Wait for the whale icon to turn **green** (bottom-right of screen)
3. This means Docker is ready

**If Docker won't start:**
- Try restarting your computer
- Make sure Hyper-V is enabled (Windows Settings → Apps → Optional Features)

---

### Step 7: Start the Development Server

```bash
npm run dev
```

**What happens:**
```
[0] Starting LiveKit server in Docker...
[1] Starting Next.js server...
[1] ▲ Next.js 14.2.33
[1] - Local: http://localhost:3000
[1] ✓ Ready in 3.2s
```

**Wait for `✓ Ready`** then proceed!

**⚠️ Keep this terminal open!** Closing it stops the server.

---

### Step 8: Open in Browser

1. Open your browser (Chrome recommended)
2. Go to: **http://localhost:3000**
3. You should see the Vibe Coding Live homepage!

**If you see the homepage** → 🎉 **SUCCESS! You're running locally!**

---

## 🔄 Development Workflow

### Daily Workflow

**Start working:**
```bash
# 1. Start Docker Desktop (if not running)
# 2. Open project in VS Code
# 3. Open terminal
npm run dev
# 4. Open localhost:3000 in browser
```

**Make changes:**
1. Edit files in VS Code
2. Save (Ctrl + S)
3. Browser auto-refreshes with changes!
4. Test your changes

**Stop working:**
```bash
# Press Ctrl + C in terminal to stop server
# Close Docker Desktop (optional - saves battery)
```

### Making Code Changes

**File organization:**
- `app/` - Pages and routes
- `components/` - Reusable UI pieces
- `lib/` - Utility functions
- `public/` - Images and static files

**Hot reload:**
- Changes auto-refresh in browser
- No need to restart server for most changes
- Exception: `.env.local` changes require restart

**Testing changes:**
1. Make change in VS Code
2. Save file
3. Check browser
4. If broken, check terminal for errors

---

## 🧪 Testing

### Manual Testing Checklist

**Homepage:**
- [ ] Homepage loads
- [ ] "Discover Streams" button works
- [ ] Live streams section shows streams
- [ ] Recorded sessions section shows videos
- [ ] Sorting buttons work (Newest/Oldest/Views)
- [ ] Category filter buttons work

**Authentication:**
- [ ] Sign up creates account
- [ ] Email verification works
- [ ] Sign in works
- [ ] Sign out works
- [ ] Navigation shows user info when logged in

**Streaming:**
- [ ] Go to `/stream/demo-live`
- [ ] Stream setup form shows
- [ ] Streamer name auto-populated
- [ ] Can fill in title, description
- [ ] "Continue to Go Live" works
- [ ] Camera turns on
- [ ] Can see yourself on screen
- [ ] Screen share works
- [ ] Zoom controls appear when screen sharing
- [ ] End stream works

**Dashboard:**
- [ ] Dashboard shows your streams
- [ ] Stats are correct
- [ ] "End Stream" button works for live streams
- [ ] "Delete" button works for recordings

**Discover Page:**
- [ ] Shows live streams only
- [ ] Category filters work
- [ ] Stream cards clickable
- [ ] Viewer counts show

---

## 🛠️ Common Development Tasks

### Update Dependencies

```bash
npm install
```

### Clear Cache and Reinstall

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Run Production Build Locally

```bash
npm run build
npm start
```

### Check for TypeScript Errors

```bash
npm run type-check
```

### Format Code

```bash
npx prettier --write .
```

---

## 🐛 Development-Specific Troubleshooting

### Changes Not Showing

**Solution:**
- Hard refresh: `Ctrl + Shift + R`
- Clear browser cache
- Restart dev server (Ctrl + C, then `npm run dev`)

### Hot Reload Stopped Working

**Solution:**
```bash
# Stop server
Ctrl + C

# Delete .next folder
rm -rf .next

# Restart
npm run dev
```

### Database Out of Sync

**Solution:**
1. Go to Supabase → SQL Editor
2. Run `setup-all-data.sql` again
3. This resets test data to known good state

---

## 📊 Understanding the Dev Environment

### What Runs Where

| Component | Where It Runs | Port | Purpose |
|-----------|---------------|------|---------|
| Next.js | Your computer | 3000 | Web server (frontend + API) |
| LiveKit | Docker container | 7880 | Streaming server (WebRTC) |
| Supabase | Cloud (supabase.co) | 443 | Database + Storage + Auth |

### File Watching

Next.js watches these files for changes:
- `app/` - Auto-reloads page
- `components/` - Auto-reloads components
- `lib/` - Auto-reloads utilities
- `public/` - Auto-refreshes assets

**Not watched:**
- `.env.local` - Requires manual restart
- `package.json` - Requires `npm install` + restart
- `next.config.js` - Requires restart

---

## 🎓 Learn More

**Understanding the Stack:**
- Next.js: Server-side React framework
- Supabase: PostgreSQL database + Auth + Storage
- LiveKit: Real-time video streaming
- Docker: Containerization platform

**Next Steps:**
- Read `PROJECT_SUMMARY.md` for architecture
- Explore `app/` folder to understand pages
- Check `components/` to see reusable UI
- Review `lib/` for utility functions

---

**Navigation:**
- 🏠 [Back to Documentation Index](INDEX.md)
- 🎓 [Complete Beginner Guide](GETTING_STARTED_COMPLETE_BEGINNER.md)
- 🐛 [Troubleshooting](TROUBLESHOOTING.md)
- 🚀 [Deploy to Production](RENDER_DEPLOYMENT.md)

