# 🎥 LiveKit Cloud Setup - Step by Step

Follow these steps IN ORDER to get live streaming working everywhere.

---

## ✅ **STEP 1: Update Render.com Environment Variables**

### **Action Required:**

1. **Open Render Dashboard:**
   - Go to: https://dashboard.render.com/web/srv-d3rj6ihr0fns73dmp2v0
   - Log in if needed

2. **Navigate to Environment:**
   - Click **"Environment"** in the left sidebar

3. **Add/Update These 3 Variables:**

   **Variable 1:**
   ```
   Key:   NEXT_PUBLIC_LIVEKIT_URL
   Value: wss://videostreamv5-yz05w4m7.livekit.cloud
   ```

   **Variable 2:**
   ```
   Key:   LIVEKIT_API_KEY
   Value: APItzRyhtWbXm34
   ```

   **Variable 3:**
   ```
   Key:   LIVEKIT_API_SECRET
   Value: 7ODDtDWt8RVgdfVTVFl199LSEABNAsN3MI9Q5s7LwtA
   ```

4. **Save:**
   - Click **"Save Changes"** button at the bottom

5. **Deploy:**
   - Go to top right corner
   - Click **"Manual Deploy" ▼** (dropdown)
   - Select **"Clear build cache & deploy"**
   - Click confirm
   - Wait 3-5 minutes (watch the logs)

### ✅ **How to Verify:**
- Deployment should succeed
- No errors in build logs
- Site should be accessible: https://vibe-live-streaming.onrender.com/

---

## ✅ **STEP 2: Update Your Local .env.local File**

### **Action Required:**

1. **Open File:**
   - Open: `.env.local` (in your project root)
   - Location: `C:\Users\Sean Fitz\OneDrive\Desktop\Vibe_Code_AI_V5\.env.local`

2. **Find These Lines** (around line 18-21):
   ```bash
   NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
   LIVEKIT_API_KEY=devkey
   LIVEKIT_API_SECRET=secret
   ```

3. **Replace With:**
   ```bash
   NEXT_PUBLIC_LIVEKIT_URL=wss://videostreamv5-yz05w4m7.livekit.cloud
   LIVEKIT_API_KEY=APItzRyhtWbXm34
   LIVEKIT_API_SECRET=7ODDtDWt8RVgdfVTVFl199LSEABNAsN3MI9Q5s7LwtA
   ```

4. **Save the file** (Ctrl+S)

### ✅ **How to Verify:**
- File saved successfully
- No syntax errors in file

---

## ✅ **STEP 3: Restart Your Local Dev Server**

### **Action Required:**

1. **Stop Current Server:**
   - Go to your terminal running `npm run dev`
   - Press **Ctrl+C**
   - Wait for it to stop

2. **Restart Server:**
   ```bash
   npm run dev
   ```
   - Wait for "Ready in X ms" message
   - Should see Docker container start (if Docker Desktop is running)

### ✅ **How to Verify:**
- Terminal shows: `✓ Ready in XXXXms`
- No error messages
- Can access: http://localhost:3000

---

## ✅ **STEP 4: Test Local Streaming**

### **Action Required:**

1. **Open Browser:**
   - Go to: http://localhost:3000
   - Open DevTools Console (F12)

2. **Try Going Live:**
   - Click **"Go Live Now"** button
   - Fill out stream details (title, description, category)
   - Click **"Start Streaming"**

3. **Watch Console:**
   - Should see: `Connecting to: wss://videostreamv5-yz05w4m7.livekit.cloud`
   - Should see: `✅ LiveKit connected`
   - Your camera should appear

### ✅ **Success Indicators:**
- ✅ Camera/mic permissions requested
- ✅ Video preview appears
- ✅ No connection errors in console
- ✅ Console shows LiveKit Cloud URL (NOT localhost:7880)

### ❌ **Failure Indicators:**
- ❌ "Failed to connect" error
- ❌ Console shows `ws://localhost:7880` (wrong URL)
- ❌ Camera doesn't appear

---

## ✅ **STEP 5: Test Production Streaming**

### **Action Required:**

1. **Open Production Site:**
   - Go to: https://vibe-live-streaming.onrender.com/
   - Open DevTools Console (F12)

2. **Sign In:**
   - Click **"Sign In"**
   - Use your test account or create new one

3. **Try Going Live:**
   - Click **"Go Live Now"**
   - Fill out stream details
   - Click **"Start Streaming"**

4. **Watch Console:**
   - Should see: `Connecting to: wss://videostreamv5-yz05w4m7.livekit.cloud`
   - Should see: `✅ LiveKit connected`
   - Your camera should appear

### ✅ **Success Indicators:**
- ✅ Camera/mic permissions requested
- ✅ Video preview appears
- ✅ No connection errors
- ✅ Can click "End Stream" successfully

### ❌ **Failure Indicators:**
- ❌ "Failed to connect to LiveKit" error
- ❌ Console shows localhost:7880
- ❌ Camera doesn't appear
- ❌ Connection timeout

---

## ✅ **STEP 6: Verify Both Environments**

### **Quick Checklist:**

**Local (http://localhost:3000):**
- [ ] Site loads
- [ ] Can go live
- [ ] Camera works
- [ ] Console shows LiveKit Cloud URL

**Production (https://vibe-live-streaming.onrender.com/):**
- [ ] Site loads
- [ ] Can sign in
- [ ] Can go live
- [ ] Camera works
- [ ] Console shows LiveKit Cloud URL

---

## 🐛 **Troubleshooting**

### **Problem: "Failed to connect to LiveKit"**

**Check:**
1. Environment variables in Render are correct (no typos)
2. `.env.local` is updated and saved
3. Dev server was restarted after changing `.env.local`
4. Browser was hard refreshed (Ctrl+Shift+R)

**Fix:**
- Re-check all environment variables
- Restart dev server
- Clear browser cache

---

### **Problem: Console shows "ws://localhost:7880"**

**Cause:** Still using old Docker localhost config

**Fix:**
1. Verify `.env.local` has `wss://videostreamv5-yz05w4m7.livekit.cloud`
2. Save the file
3. Restart dev server: Stop (Ctrl+C) then `npm run dev`
4. Hard refresh browser: Ctrl+Shift+R

---

### **Problem: Render deployment fails**

**Check Render logs for:**
- TypeScript errors
- Build failures
- Missing environment variables

**Fix:**
- Check all 3 LiveKit variables are set in Render
- Make sure `NEXT_PUBLIC_LIVEKIT_URL` has the `NEXT_PUBLIC_` prefix
- Try "Clear build cache & deploy" again

---

### **Problem: Camera permissions denied**

**Fix:**
1. Click lock icon in browser address bar
2. Allow camera and microphone
3. Refresh page

---

## 📋 **Environment Variables Summary**

**Copy this for Render.com:**

```bash
NEXT_PUBLIC_LIVEKIT_URL=wss://videostreamv5-yz05w4m7.livekit.cloud
LIVEKIT_API_KEY=APItzRyhtWbXm34
LIVEKIT_API_SECRET=7ODDtDWt8RVgdfVTVFl199LSEABNAsN3MI9Q5s7LwtA
```

**Copy this for .env.local:**

```bash
NEXT_PUBLIC_LIVEKIT_URL=wss://videostreamv5-yz05w4m7.livekit.cloud
LIVEKIT_API_KEY=APItzRyhtWbXm34
LIVEKIT_API_SECRET=7ODDtDWt8RVgdfVTVFl199LSEABNAsN3MI9Q5s7LwtA
```

---

## ✅ **Success Criteria**

**You're done when:**
- ✅ Local dev can go live with camera
- ✅ Production can go live with camera
- ✅ Both show LiveKit Cloud URL in console
- ✅ No connection errors
- ✅ Stream appears on Discover page

---

## 📞 **Need Help?**

If something doesn't work:
1. Check the troubleshooting section above
2. Review Render deployment logs
3. Check browser console for errors
4. Verify all environment variables are correct

---

## 🎉 **What's Next After Setup?**

Once LiveKit is working:
1. Run `setup-all-data.sql` in Supabase (adds test streams)
2. Test recorded video playback
3. Test live streaming end-to-end
4. Invite test users to view your stream

---

**Let me know when you've completed each step, and I can help troubleshoot if needed!**

