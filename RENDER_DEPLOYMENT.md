# 🚀 Deploy to Render.com

## Quick Setup (5 minutes)

### Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name it: `vibe-live-streaming`
4. Make it **Public** (required for free Render)
5. Click "Create repository"

### Step 2: Push Your Code
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Vibe Live Streaming"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/vibe-live-streaming.git

# Push to GitHub
git push -u origin main
```

### Step 3: Deploy to Render
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select `vibe-live-streaming`
6. Configure:
   - **Name**: `vibe-live-streaming`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### Step 4: Environment Variables
Add these in Render dashboard:
- `NODE_ENV` = `production`
- `NEXT_PUBLIC_SUPABASE_URL` = `https://zbiwmgtvxlurqyfrzjhd.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaXdtZ3R2eGx1cnF5ZnJ6amhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5Mzg3MjYsImV4cCI6MjA3NjUxNDcyNn0.M0Zb96jq4vYUz0vOBhc_1pVvDOJ3AqkWc4sDGdR6tno`
- `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaXdtZ3R2eGx1cnF5ZnJ6amhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDkzODcyNiwiZXhwIjoyMDc2NTE0NzI2fQ.7SLm_aRBRMEfZFmXVo8R0rafA4O5-iRkwr8JEwJornk`

### Step 5: Deploy!
1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Your app will be live at: `https://vibe-live-streaming.onrender.com`

## 🎉 Success!
Your streaming platform is now live and free!

## Next Steps:
1. **Custom Domain**: Add your own domain in Render settings
2. **YouTube Integration**: Add YouTube Live streaming
3. **Database**: Set up Supabase tables
4. **Styling**: Make it look amazing!

## Troubleshooting:
- **Build fails**: Check Node.js version (should be 18+)
- **App crashes**: Check environment variables
- **Slow loading**: Normal for free tier (sleeps after 15min)

## Cost: $0/month! 🆓
