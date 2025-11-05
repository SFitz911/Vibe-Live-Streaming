# 🐛 Troubleshooting Guide

**Having problems? This guide will help you fix them!**

---

## 📋 Table of Contents

1. [How to Use This Guide](#how-to-use-this-guide)
2. [Decision Tree: What's Wrong?](#decision-tree-whats-wrong)
3. [Installation Problems](#installation-problems)
4. [Server Won't Start](#server-wont-start)
5. [Database Errors](#database-errors)
6. [Camera/Streaming Issues](#camerastreaming-issues)
7. [Build/Deployment Failures](#builddeployment-failures)
8. [Common Error Messages](#common-error-messages)
9. [Still Stuck? Get Help](#still-stuck-get-help)

---

## 📖 How to Use This Guide

### Step 1: Find Your Problem
Look at the error message or symptom you're experiencing.

### Step 2: Use the Decision Tree
Follow the flowchart below to identify the category.

### Step 3: Jump to That Section
Click the link in the table of contents.

### Step 4: Follow the Solution
Try each solution in order until it works.

---

## 🌳 Decision Tree: What's Wrong?

```
🔍 What's the problem?
    |
    ├─ Software won't install
    |   └─ Go to: Installation Problems
    |
    ├─ Server won't start (npm run dev fails)
    |   └─ Go to: Server Won't Start
    |
    ├─ Error about database/Supabase
    |   └─ Go to: Database Errors
    |
    ├─ Camera/streaming not working
    |   └─ Go to: Camera/Streaming Issues
    |
    ├─ Build fails during deployment
    |   └─ Go to: Build/Deployment Failures
    |
    └─ Specific error message
        └─ Go to: Common Error Messages
            └─ Search for your exact error
```

---

## 💿 Installation Problems

### Error: "node is not recognized as a command"

**What it means:** Node.js isn't installed or isn't in your PATH.

**Solutions:**

**Solution 1: Restart Your Computer**
- After installing Node.js, restart required
- Close everything and restart
- Try `node --version` again

**Solution 2: Reinstall Node.js**
1. Uninstall Node.js (Settings → Apps → Node.js → Uninstall)
2. Restart computer
3. Download fresh from https://nodejs.org
4. During installation, check "Add to PATH"
5. Restart again
6. Try `node --version`

**Solution 3: Manually Add to PATH**
1. Press Windows Key
2. Type "environment variables"
3. Click "Edit system environment variables"
4. Click "Environment Variables"
5. Under "System variables", find "Path"
6. Click "Edit"
7. Click "New"
8. Add: `C:\Program Files\nodejs\`
9. Click OK on everything
10. Restart computer

---

### Error: "git is not recognized"

**What it means:** Git isn't installed properly.

**Solution:**
1. Download Git: https://git-scm.com/download/win
2. Install with default settings
3. Restart computer
4. Try `git --version`

---

### Error: "Docker daemon is not running"

**What it means:** Docker Desktop isn't running.

**Solutions:**

**Solution 1: Start Docker Desktop**
1. Click Windows Start
2. Search "Docker Desktop"
3. Click to open
4. Wait for whale icon to turn green (2-3 minutes)
5. Try your command again

**Solution 2: Restart Docker**
1. Right-click Docker whale icon (system tray)
2. Click "Restart"
3. Wait for it to turn green

**Solution 3: Check if Docker is installed**
1. If you don't see Docker in Start menu, it's not installed
2. Download from: https://www.docker.com/products/docker-desktop
3. Install and restart computer

---

## 🚫 Server Won't Start

### Error: "Port 3000 is already in use"

**What it means:** Another program is using port 3000.

**Solution:**

**Windows:**
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# You'll see something like: 0.0.0.0:3000 ... LISTENING 12345
# The last number (12345) is the Process ID (PID)

# Kill that process
taskkill /PID 12345 /F

# Now try npm run dev again
```

**Alternative:**
1. Check if you have another terminal running `npm run dev`
2. Press `Ctrl + C` in that terminal to stop it
3. Try again

---

### Error: "Cannot find module"

**What it means:** Dependencies aren't installed.

**Solution:**

```bash
# Delete node_modules and package-lock.json
rm -rf node_modules
rm package-lock.json

# Reinstall everything
npm install

# Try starting server again
npm run dev
```

---

### Error: "EACCES permission denied"

**What it means:** You don't have permission to write files.

**Solution (Windows):**
1. Right-click VS Code icon
2. Click "Run as administrator"
3. Try your command again

**Solution (General):**
```bash
# Give yourself permissions
npm cache clean --force
npm install
```

---

## 🗄️ Database Errors

### Error: "Invalid supabaseUrl"

**What it means:** Your `.env.local` file has wrong Supabase URL.

**Solution:**

1. Open `.env.local` in VS Code
2. Check `NEXT_PUBLIC_SUPABASE_URL=...`
3. It should look like: `https://abc123xyz.supabase.co`
4. No quotes, no spaces, must start with `https://`
5. Go to Supabase → Settings → API to get the correct URL
6. Update `.env.local`
7. Save file (Ctrl + S)
8. Restart server (Ctrl + C, then `npm run dev`)

---

### Error: "supabaseKey is required"

**What it means:** Missing or invalid Supabase anon key.

**Solution:**

1. Open `.env.local`
2. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
3. Should be a long string starting with `eyJ...`
4. Go to Supabase → Settings → API
5. Copy the **"anon public"** key
6. Paste in `.env.local`
7. Save and restart server

---

### Error: "relation 'profiles' does not exist"

**What it means:** Database tables haven't been created.

**Solution:**

1. Go to Supabase → SQL Editor
2. Open `supabase-schema.sql` from your project
3. Copy all the SQL
4. Paste in Supabase SQL Editor
5. Click "Run"
6. Should see "Success"
7. Refresh your app

---

### Error: "violates foreign key constraint"

**What it means:** Trying to create a stream without a user profile.

**Solution:**

1. Make sure you've run `setup-all-data.sql`
2. This creates test user profiles
3. If you're logged in as a real user, your profile should auto-create
4. Check Supabase → Table Editor → profiles
5. Make sure your user ID exists there

---

## 📹 Camera/Streaming Issues

### Error: "Camera blocked by browser"

**What it means:** Browser is blocking camera access.

**Solution:**

1. Look at browser address bar
2. Click the **lock icon** or **camera icon**
3. Find "Camera" permission
4. Change to **"Allow"**
5. Refresh page (Ctrl + Shift + R)
6. Try again

**Alternative:**
1. Close all browser tabs
2. Open new tab to `localhost:3000`
3. Go live again
4. Click "Allow" when asked

---

### Error: "Another app is using your camera"

**What it means:** Zoom, Teams, OBS, or another app has the camera.

**Solution:**

1. Close these apps: Zoom, Microsoft Teams, OBS, Skype
2. Check system tray for hidden apps
3. Restart your computer (easiest way)
4. Try streaming again

---

### Error: "Waiting for camera or screen share..."

**What it means:** Camera not connecting or not enabled.

**Solution:**

1. Click the "Camera is Off" button to turn it ON
2. If button says "Camera is On" but no video:
   - Refresh browser (Ctrl + Shift + R)
   - Check camera permissions
   - Try different browser (Chrome works best)

---

### Error: "Client initiated disconnect"

**What it means:** LiveKit connection dropped.

**Solution:**

1. Check if Docker is running
2. Look for green whale icon in system tray
3. If not green, start Docker Desktop
4. Wait for it to be ready
5. Refresh browser and try again

---

## 🏗️ Build/Deployment Failures

### Error: "Type error: Property does not exist"

**What it means:** TypeScript type checking is failing.

**Solution:**

**We already disabled this!** If you're still seeing it:

1. Open `next.config.js`
2. Make sure this exists:
```javascript
typescript: {
  ignoreBuildErrors: true,
},
```
3. Save file
4. Try building again

---

### Error: "Module not found: Can't resolve '@livekit/components-styles'"

**What it means:** Old package reference.

**Solution:**

1. Open any file importing it
2. Remove line: `import '@livekit/components-styles'`
3. Save file
4. Build again

---

### Error: "npm ERR! ERESOLVE could not resolve"

**What it means:** Package version conflicts.

**Solution:**

```bash
# Delete lockfile and node_modules
rm package-lock.json
rm -rf node_modules

# Clean npm cache
npm cache clean --force

# Reinstall
npm install

# Try again
npm run build
```

---

## 📝 Common Error Messages

### "ENOENT: no such file or directory"

**Meaning:** File or folder doesn't exist.

**Solution:**
- Check spelling of filename
- Make sure you're in the right directory (`pwd` or `cd`)
- File might not have been created yet

---

### "SyntaxError: Unexpected token"

**Meaning:** Code syntax error (missing bracket, comma, etc.)

**Solution:**
- Check the file and line number in error
- Look for missing `{`, `}`, `,`, or `;`
- Make sure quotes match (`"` and `"`, or `'` and `'`)

---

### "Cannot read property of undefined"

**Meaning:** Trying to access something that doesn't exist.

**Solution:**
- Check if the variable exists
- Add null/undefined checks
- Use optional chaining: `object?.property`

---

### "Failed to fetch"

**Meaning:** API request failed (network or server issue).

**Solution:**
- Check if server is running
- Check browser console for full error
- Verify API endpoint exists
- Check network tab in browser dev tools

---

## 🆘 Still Stuck? Get Help

### Before Asking for Help

**Gather this information:**

1. **What were you trying to do?**
   - "I was trying to start the server"

2. **What did you expect to happen?**
   - "Server should start and show localhost:3000"

3. **What actually happened?**
   - "Got error: Port 3000 in use"

4. **Full error message**
   - Copy the ENTIRE error (not just the last line)

5. **What you've already tried**
   - "I restarted Docker"
   - "I checked the port"

### Where to Ask

**1. GitHub Issues (Best for bugs)**
- https://github.com/SFitz911/Vibe-Live-Streaming/issues
- Click "New Issue"
- Fill in the template
- Attach screenshots if helpful

**2. Nextwork.org Support**
- Email: support@nextwork.org
- Use "Alert Staff" button in the app
- Watch troubleshooting streams

**3. AI Assistants**
- ChatGPT: https://chat.openai.com
- Claude: https://claude.ai
- Paste your error and ask for help

---

## 🔧 Emergency: Start From Scratch

**If nothing works and you want to reset:**

### Nuclear Option (Complete Reset)

```bash
# 1. Stop all servers
Press Ctrl + C in all terminals

# 2. Delete the project folder
cd ..
rm -rf Vibe-Live-Streaming

# 3. Delete node from your computer
Uninstall Node.js from Settings → Apps

# 4. Restart computer

# 5. Start over from Phase 1 of GETTING_STARTED_COMPLETE_BEGINNER.md
```

**This is the LAST RESORT!** Try all other solutions first.

---

## ✅ Prevention Tips

**To avoid problems in the future:**

1. **Always commit your changes**
   ```bash
   git add .
   git commit -m "Describe what you changed"
   ```

2. **Keep backups**
   - Copy `.env.local` to a safe place
   - Don't commit it to Git!

3. **Update regularly**
   ```bash
   git pull origin main
   npm install
   ```

4. **Read error messages**
   - Don't panic
   - Read the WHOLE message
   - Google the error

5. **Test locally before deploying**
   - Always test on `localhost:3000` first
   - Only deploy when local works

---

**Navigation:**
- 🏠 [Back to Documentation Index](INDEX.md)
- 🎓 [Complete Beginner Guide](GETTING_STARTED_COMPLETE_BEGINNER.md)
- 📖 [Project Summary](PROJECT_SUMMARY.md)

