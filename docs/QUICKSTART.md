# 🚀 Quick Start Guide

**For experienced developers - get running in 15 minutes!**

**Prerequisites:** Node.js, Git, Docker installed  
**Time:** 15-30 minutes  
**Difficulty:** Easy (if you know the tools)

---

## 📋 Table of Contents

1. [Decision Tree](#decision-tree)
2. [Fast Setup](#fast-setup)
3. [What You Can Do](#what-you-can-do-now)
4. [Key Features](#key-features)
5. [Common Commands](#common-commands)
6. [Troubleshooting](#troubleshooting)
7. [Next Steps](#next-steps)

---

## 🌳 Decision Tree

```
Do you have Node.js + Git + Docker?
    |
    ├─ YES → Continue below
    |
    └─ NO → Read GETTING_STARTED_COMPLETE_BEGINNER.md first
```

---

## ⚡ Fast Setup

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Update Environment Variables

Create `.env.local` from the template:

```bash
cp env.example .env.local
```

**Update with YOUR Supabase credentials:**

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key_here

# LiveKit Configuration (Local Development)
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

**Get YOUR Supabase keys:**
1. Go to: https://supabase.com/dashboard
2. Select your project (or create new one)
3. Click **Settings** → **API**
4. Copy **Project URL** and **anon public** key
5. Click "Reveal" to get **service_role** key
6. Paste all three in `.env.local`

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

