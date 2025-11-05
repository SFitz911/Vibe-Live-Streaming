# 🎓 Getting Started - Complete Beginner's Guide

**Never coded before? Perfect! This guide assumes ZERO technical knowledge.**

**Estimated Time:** 3-4 hours (including downloads and installations)

---

## 📋 Table of Contents

1. [What You'll Learn](#what-youll-learn)
2. [Before We Begin](#before-we-begin)
3. [Decision Tree: Should I Even Do This?](#decision-tree)
4. [Phase 1: Install Required Software](#phase-1-install-required-software)
5. [Phase 2: Create Free Accounts](#phase-2-create-free-accounts)
6. [Phase 3: Download the Code](#phase-3-download-the-code)
7. [Phase 4: Configure the Project](#phase-4-configure-the-project)
8. [Phase 5: Set Up the Database](#phase-5-set-up-the-database)
9. [Phase 6: Start the Application](#phase-6-start-the-application)
10. [Phase 7: Test Everything](#phase-7-test-everything)
11. [Troubleshooting](#troubleshooting)
12. [Next Steps](#next-steps)

---

## 🎯 What You'll Learn

By the end of this guide, you will:
- ✅ Have a working live streaming platform running on your computer
- ✅ Know how to start and stop the development server
- ✅ Understand what each file does (basic level)
- ✅ Be able to create your own streams
- ✅ Know how to update and customize the platform

---

## 📖 Before We Begin

### What is This Project?

Imagine **Twitch** or **YouTube Live**, but specifically for:
- Coding tutorials
- Tech education
- IT professionals sharing knowledge

That's what Vibe Coding Live is!

### Why Run It Locally?

**"Why can't I just use the live site?"**

You CAN! Visit https://vibe-live-streaming.onrender.com

**But running it locally lets you:**
- 🔧 Customize the look and features
- 🧪 Test changes before deploying
- 📚 Learn how web applications work
- 💼 Build your portfolio/resume
- 🎓 Understand modern web development

---

## 🌳 Decision Tree: Should I Even Do This?

```
START: Do you want to customize/learn how it works?
    |
    ├─ YES → Continue with this guide
    |     └─ Do you have 3-4 hours available?
    |         ├─ YES → Perfect! Let's begin ⬇️
    |         └─ NO → Bookmark this, come back later
    |
    └─ NO → Just use the live site
          └─ Visit: https://vibe-live-streaming.onrender.com
              ├─ Click "Get Started"
              ├─ Create account
              └─ Start streaming! (No setup needed)
```

**Still here? Great! Let's get started! 🚀**

---

## 📦 Phase 1: Install Required Software

**You need 4 programs. All are FREE.**

### 1.1 Install Node.js

**What is Node.js?**
Think of it as the "engine" that runs JavaScript code on your computer (not just in browsers).

**How to install:**

1. Go to: https://nodejs.org
2. Click the **BIG GREEN button** that says "Download Node.js (LTS)"
   - LTS = Long Term Support = Stable version
3. Open the downloaded file
4. Click "Next" → "Next" → "Next" → "Install"
5. Wait for it to finish (2-3 minutes)
6. Click "Finish"

**Verify it worked:**

1. Press `Windows Key + R`
2. Type: `cmd` and press Enter
3. In the black window, type: `node --version`
4. Press Enter
5. You should see something like: `v20.11.0`

**If you see a version number** → ✅ Success!  
**If you see "not recognized"** → ❌ Try installing again

### 1.2 Install Git

**What is Git?**
A tool for downloading and managing code. Think of it like "Track Changes" in Microsoft Word, but for code.

**How to install:**

1. Go to: https://git-scm.com/download/win
2. The download should start automatically
3. Open the downloaded file
4. Click "Next" about 10 times (default settings are fine)
5. Click "Install"
6. Wait (1-2 minutes)
7. Click "Finish"

**Verify it worked:**

1. Open Command Prompt again (Windows Key + R, type `cmd`)
2. Type: `git --version`
3. Press Enter
4. You should see: `git version 2.43.0` (or similar)

**If you see a version** → ✅ Success!

### 1.3 Install Docker Desktop

**What is Docker?**
It runs the LiveKit streaming server in a "container" (like a virtual mini-computer) so you don't have to configure complex server software.

**How to install:**

1. Go to: https://www.docker.com/products/docker-desktop
2. Click "Download for Windows"
3. Open the downloaded file
4. Follow the installer (default settings are fine)
5. **IMPORTANT:** When it asks to restart your computer, click "OK"
6. Restart your computer
7. After restart, Docker Desktop should open automatically
8. If it asks to "Use WSL 2", click "OK"

**Verify it worked:**

1. Look for the **Docker whale icon** in your system tray (bottom-right of screen)
2. It should say "Docker Desktop is running"
3. Open Command Prompt
4. Type: `docker --version`
5. You should see: `Docker version 24.0.0` (or similar)

**If Docker whale is green** → ✅ Success!  
**If it says "Docker Desktop stopped"** → Click the icon and click "Start"

### 1.4 Install VS Code (Code Editor)

**What is VS Code?**
A text editor specifically made for writing code. Like Microsoft Word, but for programmers.

**How to install:**

1. Go to: https://code.visualstudio.com
2. Click the big "Download" button
3. Open the downloaded file
4. Click "Next" → "Next" → "Next" → "Install"
5. Check the box "Add to PATH" (important!)
6. Click "Finish"

**Verify it worked:**

1. Double-click the VS Code icon on your desktop
2. It should open!

**If VS Code opens** → ✅ Success!

---

## 🌐 Phase 2: Create Free Accounts

**You need 2 accounts (both FREE):**

### 2.1 Create GitHub Account

**What is GitHub?**
A website where developers store and share code. Think of it like "Google Drive for code."

**How to create account:**

1. Go to: https://github.com
2. Click "Sign up" (top right)
3. Enter your email
4. Create a password
5. Choose a username (e.g., yourname_dev)
6. Verify email (check your inbox)
7. Click the verification link

**Done!** ✅ You now have a GitHub account.

### 2.2 Create Supabase Account

**What is Supabase?**
A "Backend-as-a-Service" - provides database, file storage, and user authentication without you having to set up servers.

**How to create account:**

1. Go to: https://supabase.com
2. Click "Start your project" or "Sign Up"
3. Sign up with **GitHub** (click "Continue with GitHub")
4. Authorize Supabase to access your GitHub
5. You'll be taken to the Supabase dashboard

**Done!** ✅ You now have a Supabase account.

**Keep this browser tab open - you'll need it in Phase 5!**

---

## 💻 Phase 3: Download the Code

**Now we'll download the Vibe Coding Live code to your computer.**

### 3.1 Open Command Prompt

1. Press `Windows Key + R`
2. Type: `cmd`
3. Press Enter
4. You should see a black window

### 3.2 Navigate to Your Desktop

**In the command prompt, type these commands (press Enter after each):**

```bash
cd Desktop
```

**What this does:** Changes the location to your Desktop folder.

### 3.3 Download (Clone) the Repository

**Type this command:**

```bash
git clone https://github.com/SFitz911/Vibe-Live-Streaming.git
```

**What this does:** Downloads all the code from GitHub to a new folder on your Desktop.

**You should see:**
```
Cloning into 'Vibe-Live-Streaming'...
remote: Counting objects...
...
done.
```

**If successful** → ✅ You now have a folder called `Vibe-Live-Streaming` on your Desktop!

### 3.4 Navigate Into the Project

**Type:**

```bash
cd Vibe-Live-Streaming
```

**What this does:** Moves you "inside" the project folder.

**Your command prompt should now show:**
```
C:\Users\YourName\Desktop\Vibe-Live-Streaming>
```

### 3.5 Install Project Dependencies

**What are dependencies?**
Other people's code (libraries) that this project uses. Like ingredients for a recipe.

**Type:**

```bash
npm install
```

**What this does:** Downloads ~600 code libraries that the project needs.

**This takes 2-5 minutes.** You'll see lots of text scrolling by - that's normal!

**When done, you'll see:**
```
added 588 packages in 3m
```

**If you see that** → ✅ Success!

---

## ⚙️ Phase 4: Configure the Project

**Now we need to tell the project YOUR account details.**

### 4.1 Open the Project in VS Code

**From your command prompt, type:**

```bash
code .
```

**What this does:** Opens VS Code with your project loaded.

**If a new VS Code window opens** → ✅ Success!

### 4.2 Create Environment Variables File

**What are environment variables?**
Secret configuration values (like your database password) that the app needs to run.

**In VS Code:**

1. Look at the left sidebar - you'll see a list of files
2. Find a file called `env.example`
3. **Right-click** on `env.example`
4. Click **"Copy"**
5. **Right-click** in the file list area
6. Click **"Paste"**
7. **Right-click** on the new copy
8. Click **"Rename"**
9. Rename it to: `.env.local` (notice the DOT at the start!)
10. Press Enter

**You now have a file called `.env.local`** ✅

### 4.3 Get Your Supabase Credentials

**Switch to your Supabase browser tab (from Phase 2):**

1. Click "New Project" (if you haven't already)
2. Fill in:
   - **Name:** `vibe-coding-live`
   - **Database Password:** Create a strong password (SAVE THIS!)
   - **Region:** Choose closest to you
3. Click "Create new project"
4. Wait 2-3 minutes for setup

**Once ready:**

5. Click on your project name
6. Click the **"Settings"** icon (gear icon, bottom left)
7. Click **"API"** in the settings menu
8. You'll see **"Project API keys"**

**Copy these two values:**
- **Project URL** (looks like: `https://abc123xyz.supabase.co`)
- **anon public** key (long text starting with `eyJ...`)

### 4.4 Fill in Your Environment Variables

**In VS Code:**

1. Click on `.env.local` to open it
2. Find this line:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hjhmgllhkppevwzocvtm.supabase.co
   ```
3. **Replace** `https://hjhmgllhkppevwzocvtm.supabase.co` with **YOUR** Project URL
4. Find this line:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
5. **Replace** `your_supabase_anon_key_here` with **YOUR** anon public key

**Save the file** (Ctrl + S)

**✅ Configuration complete!**

---

## 🗄️ Phase 5: Set Up the Database

**Your database needs tables and initial data.**

### 5.1 Go to Supabase SQL Editor

1. In your Supabase browser tab, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. You'll see a big text box

### 5.2 Create Database Schema

**In VS Code:**

1. Click on `supabase-schema.sql` (in the file list)
2. Press `Ctrl + A` (select all)
3. Press `Ctrl + C` (copy)

**In Supabase (browser):**

4. Click in the SQL editor text box
5. Press `Ctrl + V` (paste)
6. Click the **green "Run" button** (or press Ctrl + Enter)

**You should see:** "Success. No rows returned" (this is good!)

**What this did:** Created all the database tables (profiles, streams, chat_messages, etc.)

### 5.3 Add Test Data

**In VS Code:**

1. Click on `setup-all-data.sql`
2. Press `Ctrl + A` (select all)
3. Press `Ctrl + C` (copy)

**In Supabase (browser):**

4. Clear the SQL editor (select all and delete)
5. Press `Ctrl + V` (paste the new SQL)
6. Click **"Run"**

**You should see:** "Setup complete! ✅ Live streams for Discover, Recorded for Homepage"

**What this did:** Added 4 test users and 16 test streams to your database.

### 5.4 Set Up Video Storage

**This allows the platform to save recorded streams.**

**In Supabase (browser):**

1. Click **"SQL Editor"** → **"New query"**
2. **Copy this SQL:**

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('stream-recordings', 'stream-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for recordings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload recordings" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete recordings" ON storage.objects;

-- Create policies
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

3. Paste it in the SQL editor
4. Click **"Run"**

**You should see:** "Success. No rows returned"

**What this did:** Created a storage bucket where video recordings will be saved.

---

## 🚀 Phase 6: Start the Application

**Almost there! Now we'll actually run the app.**

### 6.1 Start Docker Desktop

1. Click the Windows Start button
2. Search for "Docker Desktop"
3. Click to open it
4. Wait for the whale icon in your system tray to turn **green**
5. This means Docker is running

**If it's already green** → ✅ Skip to next step!

### 6.2 Open Terminal in VS Code

**In VS Code:**

1. Click **"Terminal"** menu (top menu bar)
2. Click **"New Terminal"**
3. A panel opens at the bottom

**You should see something like:**
```
PS C:\Users\YourName\Desktop\Vibe-Live-Streaming>
```

### 6.3 Start the Development Server

**In the VS Code terminal, type:**

```bash
npm run dev
```

**Press Enter**

**What happens:**
- LiveKit streaming server starts in Docker (this takes 10-20 seconds)
- Next.js web server starts (this takes 10-20 seconds)

**You'll see messages like:**
```
> concurrently "npm run dev:livekit" "npm run dev:next"
[0] docker run...
[1] ▲ Next.js 14.2.33
[1] - Local: http://localhost:3000
[1] ✓ Ready in 3.2s
```

**When you see `✓ Ready`** → ✅ Success! The server is running!

**⚠️ IMPORTANT:** Keep this terminal window open! If you close it, the server stops.

---

## 🧪 Phase 7: Test Everything

**Your app should now be running!**

### 7.1 Open in Browser

1. Open your web browser (Chrome, Edge, Firefox)
2. Go to: `http://localhost:3000`
3. Press Enter

**You should see:** The Vibe Coding Live homepage!

### 7.2 Create an Account

1. Click **"Get Started"** (top right)
2. Fill in:
   - **Display Name:** Your name (e.g., "John Doe")
   - **Username:** Pick a username (e.g., "johncodes")
   - **Email:** Your email
   - **Password:** At least 6 characters
3. Click **"Create Account"**

**Check your email!** Supabase sends a verification email.

**If you see "Check your email to confirm"** → ✅ Success!

### 7.3 Verify Your Email

1. Open your email inbox
2. Find email from Supabase
3. Click the **"Confirm your email"** link
4. You'll be redirected back to the app
5. You're now logged in!

### 7.4 Browse Streams

1. Click **"Discover"** in the top navigation
2. You should see **5 live test streams**
3. You should see category buttons: "Web Development", "AWS Cloud", etc.

**If you see streams** → ✅ Database is working!

### 7.5 Try Going Live

1. Click **"Go Live Now"** (red button on homepage)
2. Fill in:
   - **Streamer Name:** (auto-filled with your name - can't change)
   - **Stream Title:** "My First Test Stream"
   - **Description:** "Testing the platform"
   - **Category:** "Web Development"
3. Click **"Continue to Go Live"**
4. Click **"Start Camera & Join Room"**
5. **Allow camera and microphone** when browser asks
6. You should see yourself on screen!

**If you see your camera** → ✅ Streaming works!

**Click "End Stream"** when done.

### 7.6 Check Your Dashboard

1. Click **"Dashboard"** in navigation
2. You should see:
   - Your stream you just created
   - Stats (Total Streams: 1)
   - Quick action buttons

**If you see your stream** → ✅ Everything is working!

---

## 🎉 Congratulations!

**You did it! You have:**
- ✅ Installed all required software
- ✅ Created accounts
- ✅ Downloaded and configured the code
- ✅ Set up the database
- ✅ Started the server
- ✅ Created a stream

**You're now a local developer!** 🎓

---

## 🐛 Troubleshooting

### Problem: "node is not recognized"

**Solution:**
1. Restart your computer
2. Try the `node --version` command again
3. If still fails, reinstall Node.js

### Problem: "Docker is not running"

**Solution:**
1. Open Docker Desktop manually
2. Wait for the whale icon to turn green
3. Try `npm run dev` again

### Problem: "Port 3000 is already in use"

**Solution:**
1. Something else is using port 3000
2. In terminal, press `Ctrl + C` to stop
3. Type: `netstat -ano | findstr :3000`
4. Find the PID (last number)
5. Type: `taskkill /PID [number] /F` (replace [number] with the PID)
6. Try `npm run dev` again

### Problem: "Cannot connect to database"

**Solution:**
1. Check your `.env.local` file
2. Make sure Supabase URL and key are correct
3. No extra spaces before/after the values
4. Save the file and restart server (Ctrl + C, then `npm run dev`)

### Problem: "Camera not working"

**Solution:**
1. Check browser permissions (click lock icon in address bar)
2. Make sure camera is set to "Allow"
3. Close other apps using camera (Zoom, Teams, etc.)
4. Refresh browser with Ctrl + Shift + R

---

## 📖 Next Steps

**Now that it's working, you can:**

1. **Customize the Look:**
   - Open `app/globals.css` to change colors
   - Edit `components/Navigation.tsx` to change menu items
   - Modify `app/page.tsx` to change homepage content

2. **Learn the Codebase:**
   - Read `docs/PROJECT_SUMMARY.md` for architecture overview
   - Explore files in VS Code
   - Try making small changes and seeing what happens

3. **Deploy Online:**
   - Read `docs/RENDER_DEPLOYMENT.md`
   - Host your own version on the internet
   - Share it with friends!

4. **Add Features:**
   - Read the code comments
   - Try adding new buttons or pages
   - Experiment and learn!

---

## 🆘 Getting Help

**Stuck? Here's what to do:**

1. **Read error messages carefully** - they often tell you what's wrong
2. **Check `docs/TROUBLESHOOTING.md`** - common problems and solutions
3. **Search Google** - copy/paste error messages
4. **Ask ChatGPT or AI** - "I'm getting this error: [paste error]"
5. **GitHub Issues** - https://github.com/SFitz911/Vibe-Live-Streaming/issues

---

## ✅ Completion Checklist

Mark these off as you complete them:

- [ ] Installed Node.js, Git, Docker, VS Code
- [ ] Created GitHub and Supabase accounts
- [ ] Downloaded the code
- [ ] Installed dependencies (`npm install`)
- [ ] Created `.env.local` file
- [ ] Added Supabase credentials to `.env.local`
- [ ] Ran database schema SQL
- [ ] Ran test data SQL
- [ ] Set up storage bucket
- [ ] Started development server (`npm run dev`)
- [ ] Opened `localhost:3000` in browser
- [ ] Created an account
- [ ] Verified email
- [ ] Browsed streams
- [ ] Created a test stream
- [ ] Viewed dashboard

**All checked?** → 🎉 You're done! Welcome to web development!

---

## 🎓 You've Learned

**Even if you didn't realize it, you now know:**
- ✅ How to use command line/terminal
- ✅ How to install software
- ✅ What Node.js and npm are
- ✅ How to clone Git repositories
- ✅ How to set environment variables
- ✅ How to run a web application
- ✅ How databases work (basics)
- ✅ What frontend vs backend means

**That's HUGE for a beginner!** 🎉

Keep exploring, keep learning, and don't be afraid to break things - that's how you learn!

---

**Navigation:**
- 🏠 [Back to Documentation Index](INDEX.md)
- ⏭️ [Next: Local Development Guide](LOCAL_DEVELOPMENT.md)
- 🐛 [Troubleshooting Guide](TROUBLESHOOTING.md)

