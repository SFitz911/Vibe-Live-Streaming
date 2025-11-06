# 🚀 ACTION PLAN - Fix Signup & Enable LiveKit

## 📋 **Two Issues to Fix:**

1. ❌ **Signup Error:** "new row violates row-level security policy for table 'profiles'"
2. ⏳ **Live Streaming:** Need LiveKit Cloud for "Go Live" to work

---

## ⚡ **PART 1: Fix Signup Error (2 minutes)**

### **The Problem:**
Users can't sign up because the profiles table is missing an INSERT permission policy.

### **The Solution:**
Run this SQL in Supabase to add the missing policy.

### **Steps:**

1. **Go to Supabase:**
   - Visit: https://supabase.com/dashboard/project/hjhmgllhkppevwzocvtm
   - Click **"SQL Editor"** (left sidebar)
   - Click **"New Query"**

2. **Copy & Paste this SQL:**
   - Open file: `fix-profile-signup.sql` (in your project root)
   - Copy ALL contents
   - Paste into Supabase SQL Editor

3. **Run It:**
   - Click **"Run"** (bottom right green button)
   - Should see: ✅ "Profile signup policy fixed! Users can now create accounts."

4. **Test Signup:**
   - Go to: https://vibe-live-streaming.onrender.com/auth/signup
   - Try creating account with: Abdul Sulaiman (or any name)
   - Should work now! ✅

---

## ⚡ **PART 2: Set Up LiveKit Cloud (5 minutes)**

### **Step 2.1: Update Render.com Environment**

1. **Find Your Render Service:**
   - Go to: https://dashboard.render.com/
   - Look for your service (named "Vibe-Live-Streaming" or similar)
   - Click on it

2. **Add Environment Variables:**
   - Click **"Environment"** (left sidebar)
   - Add these 3 variables:

   ```
   Key:   NEXT_PUBLIC_LIVEKIT_URL
   Value: wss://videostreamv5-yz05w4m7.livekit.cloud

   Key:   LIVEKIT_API_KEY
   Value: APItzRyhtWbXm34

   Key:   LIVEKIT_API_SECRET
   Value: 7ODDtDWt8RVgdfVTVFl199LSEABNAsN3MI9Q5s7LwtA
   ```

3. **Save & Deploy:**
   - Click **"Save Changes"**
   - Click **"Manual Deploy" ▼** → **"Clear build cache & deploy"**
   - Wait 3-5 minutes

---

### **Step 2.2: Update Local Environment**

1. **Open File:**
   - Open: `.env.local` (in your project root)

2. **Find the LiveKit Section** (around line 18-21):
   ```bash
   # OLD (will look like this):
   NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
   LIVEKIT_API_KEY=devkey
   LIVEKIT_API_SECRET=secret
   ```

3. **Replace With:**
   ```bash
   # NEW:
   NEXT_PUBLIC_LIVEKIT_URL=wss://videostreamv5-yz05w4m7.livekit.cloud
   LIVEKIT_API_KEY=APItzRyhtWbXm34
   LIVEKIT_API_SECRET=7ODDtDWt8RVgdfVTVFl199LSEABNAsN3MI9Q5s7LwtA
   ```

4. **Save** (Ctrl+S)

---

### **Step 2.3: Restart Local Server**

1. **Stop Current Server:**
   - Go to terminal running `npm run dev`
   - Press **Ctrl+C**

2. **Start Server:**
   ```bash
   npm run dev
   ```
   - Wait for "Ready in X ms"

---

## ✅ **PART 3: Test Everything**

### **Test 1: Signup (Production)**

1. Go to: https://vibe-live-streaming.onrender.com/auth/signup
2. Create account with any name (e.g., "Test User")
3. Should work without RLS error ✅

---

### **Test 2: Live Streaming (Local)**

1. Go to: http://localhost:3000
2. Sign in
3. Click **"Go Live Now"**
4. Open browser console (F12)
5. Should see: `Connecting to: wss://videostreamv5-yz05w4m7.livekit.cloud`
6. Camera should turn on ✅

---

### **Test 3: Live Streaming (Production)**

1. Go to: https://vibe-live-streaming.onrender.com/
2. Sign in
3. Click **"Go Live Now"**
4. Open browser console (F12)
5. Should see: `Connecting to: wss://videostreamv5-yz05w4m7.livekit.cloud`
6. Camera should turn on ✅

---

## 📋 **Quick Checklist**

- [ ] Run `fix-profile-signup.sql` in Supabase
- [ ] Test signup works (no RLS error)
- [ ] Add 3 LiveKit variables to Render.com
- [ ] Deploy Render ("Clear build cache & deploy")
- [ ] Update `.env.local` with LiveKit Cloud credentials
- [ ] Restart local dev server
- [ ] Test local streaming works
- [ ] Test production streaming works

---

## 🐛 **Troubleshooting**

### **Signup Still Fails:**
- Make sure you ran the SQL in Supabase
- Check for "✅ Profile signup policy fixed!" success message
- Try refreshing the signup page

### **Live Streaming Fails:**
- Check browser console for errors
- Make sure variables have correct values (no typos)
- Verify `NEXT_PUBLIC_LIVEKIT_URL` has `NEXT_PUBLIC_` prefix
- Hard refresh browser (Ctrl+Shift+R)

### **"Still seeing localhost:7880":**
- Verify `.env.local` is saved with LiveKit Cloud URL
- Restart dev server (Ctrl+C then `npm run dev`)
- Clear browser cache

---

## 🎉 **When Done:**

You should have:
- ✅ Users can sign up without errors
- ✅ Local live streaming works (camera on)
- ✅ Production live streaming works
- ✅ Console shows LiveKit Cloud URL (not localhost)

---

## 📞 **Need Help?**

If stuck:
1. Check which step failed
2. Look at browser console errors
3. Check Render deployment logs
4. Verify all environment variables

**Files to Reference:**
- `fix-profile-signup.sql` - SQL to fix signup
- `COPY_PASTE_FOR_RENDER.txt` - LiveKit variables for Render
- `SETUP_LIVEKIT_NOW.md` - Detailed LiveKit guide

