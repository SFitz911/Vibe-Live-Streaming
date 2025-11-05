# 🎥 LiveKit Cloud Configuration

## ✅ Your LiveKit Cloud Credentials

**Project:** videostreamv5-yz05w4m7  
**Region:** Auto-selected by LiveKit

```
WebSocket URL: wss://videostreamv5-yz05w4m7.livekit.cloud
API Key:       APItzRyhtWbXm34
API Secret:    7ODDtDWt8RVgdfVTVFl199LSEABNAsN3MI9Q5s7LwtA
```

---

## 🚀 Setup Instructions

### **1. Update Render.com (Production)**

**Critical Steps:**

1. Go to: https://dashboard.render.com/web/srv-d3rj6ihr0fns73dmp2v0
2. Click **"Environment"** in left sidebar
3. Find or add these variables:

```bash
NEXT_PUBLIC_LIVEKIT_URL=wss://videostreamv5-yz05w4m7.livekit.cloud
LIVEKIT_API_KEY=APItzRyhtWbXm34
LIVEKIT_API_SECRET=7ODDtDWt8RVgdfVTVFl199LSEABNAsN3MI9Q5s7LwtA
```

4. Click **"Save Changes"**
5. Go to top right → **"Manual Deploy" ▼**
6. Select **"Clear build cache & deploy"**
7. Wait 3-5 minutes

**Test Production:**
- Visit: https://vibe-live-streaming.onrender.com/
- Click "Go Live Now"
- Should connect to LiveKit Cloud (not localhost)

---

### **2. Update Local Environment**

**Edit `.env.local` file:**

Open: `C:\Users\Sean Fitz\OneDrive\Desktop\Vibe_Code_AI_V5\.env.local`

**Find these lines (around line 18-21):**
```bash
# OLD (Docker local)
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

**Replace with:**
```bash
# NEW (LiveKit Cloud)
NEXT_PUBLIC_LIVEKIT_URL=wss://videostreamv5-yz05w4m7.livekit.cloud
LIVEKIT_API_KEY=APItzRyhtWbXm34
LIVEKIT_API_SECRET=7ODDtDWt8RVgdfVTVFl199LSEABNAsN3MI9Q5s7LwtA
```

**Restart Dev Server:**
```bash
# Stop current server (Ctrl+C in terminal)
npm run dev
```

**Test Local:**
- Visit: http://localhost:3000
- Click "Go Live Now"
- Should connect to LiveKit Cloud

---

## 🔍 How to Verify It's Working

### **Production Check:**

1. Open browser console (F12)
2. Go to: https://vibe-live-streaming.onrender.com/
3. Click "Go Live Now"
4. Console should show:
   ```
   Connecting to: wss://videostreamv5-yz05w4m7.livekit.cloud
   ✅ LiveKit connected
   ```
5. NOT:
   ```
   ❌ Failed to connect to ws://localhost:7880
   ```

### **Local Check:**

1. Open browser console (F12)
2. Go to: http://localhost:3000
3. Click "Go Live Now"
4. Console should show connection to LiveKit Cloud (not localhost:7880)

---

## 📊 Benefits of LiveKit Cloud

### **Before (Docker localhost):**
- ❌ Only works on your computer
- ❌ Doesn't work on production
- ❌ Can't share streams with others
- ❌ Requires Docker running

### **After (LiveKit Cloud):**
- ✅ Works everywhere (local + production)
- ✅ Users can stream from any device
- ✅ Professional infrastructure
- ✅ No Docker required (optional for other services)
- ✅ Auto-scaling
- ✅ Global CDN

---

## 🎯 Current Status

- **LiveKit Cloud Account:** ✅ Created
- **Credentials:** ✅ Obtained
- **env.example:** ✅ Updated
- **.env.local:** ⏳ You need to update manually
- **Render.com:** ⏳ You need to update environment variables

---

## 🔐 Security Notes

**Important:**
- ✅ These credentials are for YOUR project only
- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ✅ Render environment variables are encrypted
- ⚠️ Don't share API Secret publicly
- ⚠️ Don't commit credentials to public repos

---

## 📞 LiveKit Cloud Dashboard

Access your LiveKit project:
- **Dashboard:** https://cloud.livekit.io/
- **Project:** videostreamv5-yz05w4m7
- **Features:**
  - View active rooms
  - Monitor usage
  - See connection logs
  - Manage API keys
  - Check billing (free tier: 10,000 minutes/month)

---

## 🐛 Troubleshooting

### "Failed to connect to LiveKit"

**Check:**
1. Environment variables are correct (no typos)
2. WebSocket URL starts with `wss://` (not `ws://`)
3. Render deployment completed successfully
4. Browser console for specific error messages

### "Localhost connection refused"

**Cause:** Still using old Docker localhost config

**Fix:**
1. Update `.env.local` with LiveKit Cloud URL
2. Restart dev server: `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R`

### "Invalid LiveKit token"

**Cause:** API Key/Secret mismatch

**Fix:**
1. Verify credentials match LiveKit dashboard
2. Check no extra spaces in environment variables
3. Redeploy on Render with correct values

---

## 📋 Quick Reference

**Environment Variables for Render:**
```
NEXT_PUBLIC_LIVEKIT_URL=wss://videostreamv5-yz05w4m7.livekit.cloud
LIVEKIT_API_KEY=APItzRyhtWbXm34
LIVEKIT_API_SECRET=7ODDtDWt8RVgdfVTVFl199LSEABNAsN3MI9Q5s7LwtA
```

**Copy this entire block** → Paste into Render Environment tab

