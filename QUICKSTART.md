# 🚀 Quick Start Guide - Vibe Live

Get up and running in 5 minutes!

## ⚡ Fast Setup

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Update Environment Variables

Your Supabase project is already set up! Just update `.env.local` (create it if it doesn't exist):

\`\`\`env
# ✅ Supabase - Already Configured!
NEXT_PUBLIC_SUPABASE_URL=https://zbiwmgtvxlurqyfrzjhd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaXdtZ3R2eGx1cnF5ZnJ6amhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5Mzg3MjYsImV4cCI6MjA3NjUxNDcyNn0.M0Zb96jq4vYUz0vOBhc_1pVvDOJ3AqkWc4sDGdR6tno
SUPABASE_SERVICE_ROLE_KEY=get_from_supabase_dashboard

# 🔧 AWS - Set these up (see AWS_SETUP.md)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your-bucket
AWS_CLOUDFRONT_DOMAIN=your-cdn.cloudfront.net
AWS_IVS_CHANNEL_ARN=arn:aws:ivs:...
AWS_IVS_PLAYBACK_URL=https://...

# 🌐 App
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

**Get Service Role Key:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/zbiwmgtvxlurqyfrzjhd/settings/api)
2. Copy the `service_role` key (secret!)
3. Paste it in `.env.local`

### 3. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 📱 What You Can Do Now

### Without AWS Setup (Testing):
- ✅ Create an account
- ✅ Set up your profile
- ✅ Browse the interface
- ✅ Test chat functionality
- ✅ Create stream entries (won't stream yet)

### With AWS Setup (Full Features):
- ✅ Go live with OBS
- ✅ Stream to viewers
- ✅ Upload thumbnails
- ✅ Record streams
- ✅ Use CDN for assets

## 🎥 Setting Up Streaming (Optional for Now)

Want to go live? Follow [AWS_SETUP.md](./AWS_SETUP.md) to:
1. Create AWS IVS channel (15 min)
2. Set up S3 bucket (5 min)
3. Configure CloudFront (5 min)
4. Test with OBS (5 min)

**Total time: ~30 minutes**

## 🎯 Key Features

### Pages
- `/` - Home with live streams
- `/discover` - Browse by category
- `/stream/[id]` - Watch stream + chat
- `/dashboard` - Creator dashboard
- `/dashboard/stream/new` - Create stream
- `/auth/login` - Sign in/up

### Database (Supabase)
Your project already has:
- ✅ `profiles` table
- ✅ `streams` table
- ✅ `chat_messages` table
- ✅ `followers` table
- ✅ `stream_views` table
- ✅ Row Level Security enabled

### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Realtime)
- AWS IVS + S3 + CloudFront

## 🛠️ Common Commands

\`\`\`bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm run type-check   # Check TypeScript

# Docker
docker-compose up -d # Run with Docker
docker-compose down  # Stop containers
\`\`\`

## 🐛 Troubleshooting

### "Module not found" errors
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Environment variables not loading
- Restart dev server after changing `.env.local`
- Make sure file is named exactly `.env.local`
- Check for typos in variable names

### Supabase connection issues
- Verify project URL is correct
- Check anon key is complete (very long string)
- Ensure you're using the correct project (zbiwmgtvxlurqyfrzjhd)

### Build fails
\`\`\`bash
npm run type-check  # Check for TypeScript errors
npm run lint        # Check for linting errors
\`\`\`

## 📚 Next Steps

1. **Explore the code**
   - Check `app/` for pages
   - Look at `components/` for reusable UI
   - Review `lib/` for utilities

2. **Customize**
   - Update branding in `components/Navigation.tsx`
   - Change colors in `tailwind.config.js`
   - Modify categories in pages

3. **Add features**
   - Implement follow system
   - Add stream notifications
   - Create VOD playback
   - Build analytics dashboard

4. **Deploy**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for options
   - Vercel is fastest (5 min setup)

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [AWS IVS Guide](https://docs.aws.amazon.com/ivs/)

## 💡 Tips

- **Start simple**: Test without AWS first
- **Read the README**: Comprehensive project overview
- **Check examples**: Each page has working code
- **Use hot reload**: Changes reflect immediately in dev mode
- **Inspect Network**: Use browser DevTools to debug API calls

## 🆘 Need Help?

1. Check [README.md](./README.md) - Full documentation
2. Review [AWS_SETUP.md](./AWS_SETUP.md) - AWS configuration
3. See [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment options
4. Check Supabase Dashboard for database logs
5. Review browser console for errors

## ✅ Checklist

- [ ] Dependencies installed
- [ ] `.env.local` created with Supabase keys
- [ ] Dev server running
- [ ] Can access http://localhost:3000
- [ ] Can create an account
- [ ] Can navigate between pages
- [ ] (Optional) AWS services configured
- [ ] (Optional) Can stream with OBS

---

**You're all set! Start building your streaming platform! 🚀**

