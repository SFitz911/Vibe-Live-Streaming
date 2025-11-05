# 🎥 Vibe Coding Live

**A modern live streaming platform for IT professionals and learners**

Built with Next.js, Supabase, and LiveKit for browser-based live streaming with automatic recording.

---

## 📚 Table of Contents

1. [What is Vibe Coding Live?](#what-is-vibe-coding-live)
2. [Quick Start Guide](#quick-start-guide)
3. [Documentation Index](#documentation-index)
4. [For Complete Beginners](#for-complete-beginners)
5. [Tech Stack](#tech-stack)
6. [Features](#features)
7. [License](#license)

---

## 🎯 What is Vibe Coding Live?

Vibe Coding Live is a **Twitch-like streaming platform** specifically designed for:
- 👨‍💻 **IT professionals** sharing live coding sessions
- 📚 **Educators** teaching programming and technology
- 🚀 **Learners** watching and interacting with live streams
- 🎬 **Content creators** who want automatic recording and playback

**Key Features:**
- ✅ **Browser-based streaming** - No OBS required, stream directly from your browser
- ✅ **Screen sharing** - Share your code editor, terminal, or entire screen
- ✅ **Automatic recording** - Every stream is automatically recorded and saved
- ✅ **5GB storage management** - Auto-deletes oldest recordings when limit is reached
- ✅ **User authentication** - Secure login and user profiles
- ✅ **Category filtering** - Organize streams by topic (Web Dev, AWS, AI, etc.)
- ✅ **Zoom controls** - Viewers can zoom in on screen shares during live coding

---

## 🚀 Quick Start Guide

### For the Impatient (Experienced Developers)

```bash
# Clone the repository
git clone https://github.com/SFitz911/Vibe-Live-Streaming.git
cd Vibe-Live-Streaming

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your Supabase credentials

# Start Docker Desktop
# Then start development server
npm run dev

# Open http://localhost:3000
```

**Then:**
1. Run `docs/SUPABASE_STORAGE_SETUP.md` SQL in Supabase
2. Run `supabase-schema.sql` in Supabase
3. Run `setup-all-data.sql` in Supabase

---

## 📖 Documentation Index

**🔰 For Beginners - Start Here:**
- [`docs/GETTING_STARTED_COMPLETE_BEGINNER.md`](docs/GETTING_STARTED_COMPLETE_BEGINNER.md) - Complete setup from zero
- [`docs/QUICKSTART.md`](docs/QUICKSTART.md) - Fast setup if you have tools installed

**🔧 Setup Guides:**
- [`docs/LOCAL_DEVELOPMENT.md`](docs/LOCAL_DEVELOPMENT.md) - Set up local development environment
- [`docs/SUPABASE_STORAGE_SETUP.md`](docs/SUPABASE_STORAGE_SETUP.md) - Configure video storage
- [`docs/LIVEKIT_SETUP.md`](docs/LIVEKIT_SETUP.md) - LiveKit streaming server setup

**☁️ Cloud Services (Optional):**
- [`docs/AWS_SETUP.md`](docs/AWS_SETUP.md) - Amazon Web Services (IVS, S3, CloudFront)
- [`docs/OWNCAST_SETUP.md`](docs/OWNCAST_SETUP.md) - Self-hosted streaming alternative

**🚀 Deployment:**
- [`docs/RENDER_DEPLOYMENT.md`](docs/RENDER_DEPLOYMENT.md) - Deploy to Render.com (recommended)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) - General deployment guide

**📊 Reference:**
- [`docs/PROJECT_SUMMARY.md`](docs/PROJECT_SUMMARY.md) - Architecture and technical overview
- [`docs/WORKING_LOCAL_BACKUP.md`](docs/WORKING_LOCAL_BACKUP_2025-11-05.md) - Complete working configuration backup
- [`docs/DevTeam.md`](docs/DevTeam.md) - Developer team information

---

## 🎓 For Complete Beginners

**Never coded before? No problem!**

### Step 1: Do I Need to Code?

**If you just want to USE the platform (stream and watch):**
- ❌ NO coding needed
- Just visit the live site: https://vibe-live-streaming.onrender.com
- Click "Get Started" to create an account
- Start streaming from your browser!

**If you want to RUN YOUR OWN version (customize and host):**
- ✅ YES, you'll need to follow setup guides
- Start with: [`docs/GETTING_STARTED_COMPLETE_BEGINNER.md`](docs/GETTING_STARTED_COMPLETE_BEGINNER.md)
- Estimated time: 2-3 hours for first-time setup

### What You'll Need:

**Software to Install (All FREE):**
1. ✅ **Node.js** - JavaScript runtime (https://nodejs.org)
2. ✅ **Git** - Version control (https://git-scm.com)
3. ✅ **Docker Desktop** - Container platform (https://docker.com)
4. ✅ **VS Code** - Code editor (https://code.visualstudio.com)

**Accounts to Create (All FREE):**
1. ✅ **Supabase** - Database and storage (https://supabase.com)
2. ✅ **GitHub** - Code repository (https://github.com)
3. ✅ **Render.com** - Hosting (https://render.com) - Optional

**Estimated Costs:**
- ✅ **Local Development**: $0 (completely free)
- ✅ **Supabase Free Tier**: $0 up to 500MB database + 1GB storage
- ✅ **Render Free Tier**: $0 for hobby projects
- 💰 **If you exceed free tiers**: ~$5-10/month

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with server-side rendering
- **React 18** - UI component library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling

### Backend & Database
- **Supabase** - PostgreSQL database, authentication, storage
- **LiveKit** - Real-time video streaming SDK
- **Node.js** - Server runtime

### Infrastructure
- **Docker** - Containerization for local LiveKit server
- **Render.com** - Cloud hosting and deployment
- **GitHub** - Version control and code repository

### Media & Streaming
- **LiveKit Components** - Pre-built video UI components
- **MediaRecorder API** - Browser-based video recording
- **WebRTC** - Real-time communication protocol

---

## ✨ Features

### For Streamers
- 🎥 **Browser-based streaming** - No OBS or external software needed
- 📹 **Camera + Screen Share** - Stream your face and screen simultaneously
- 🔍 **Zoom controls** - Viewers can zoom in on your screen during coding sessions
- 📊 **Stream dashboard** - View all your past streams, analytics, and stats
- 🗑️ **Delete recordings** - Remove old streams from your archive
- 👤 **Custom profiles** - Display name, username, verified badge

### For Viewers
- 🔴 **Live stream discovery** - Browse streams by category
- 📺 **Watch recordings** - Replay past streams anytime
- 🔍 **Search & filter** - Find streams by topic, creator, or category
- 💬 **Live chat** - Interact with streamers and other viewers
- 🆘 **Expert help** - Request assistance from Nextwork.org instructors

### Platform Features
- 🔐 **Authentication** - Secure signup/login with Supabase Auth
- 💾 **Auto-recording** - Every stream is automatically saved
- 🧹 **Storage management** - Auto-deletes oldest recordings at 5GB limit
- 📱 **Responsive design** - Works on desktop, tablet, and mobile
- ⚡ **Real-time updates** - Live viewer counts and stream status

---

## 🎯 Decision Tree: Where Should I Start?

```
START HERE
    |
    ├─ I want to WATCH streams
    |   └─ Visit https://vibe-live-streaming.onrender.com
    |       ├─ Click "Discover" to browse live streams
    |       └─ Click "Get Started" to create free account
    |
    ├─ I want to START STREAMING
    |   └─ Visit https://vibe-live-streaming.onrender.com
    |       ├─ Click "Get Started" to create account
    |       ├─ Click "Go Live Now"
    |       ├─ Fill out stream details
    |       └─ Allow camera/mic and start streaming!
    |
    ├─ I want to RUN LOCALLY (test and develop)
    |   └─ Read docs/GETTING_STARTED_COMPLETE_BEGINNER.md
    |       ├─ Install required software
    |       ├─ Set up Supabase account
    |       ├─ Run local development server
    |       └─ Test on localhost:3000
    |
    └─ I want to DEPLOY MY OWN (host my own platform)
        └─ Read docs/RENDER_DEPLOYMENT.md
            ├─ Set up Render.com account
            ├─ Connect GitHub repository
            ├─ Configure environment variables
            └─ Deploy and go live!
```

---

## 📁 Project Structure

```
Vibe_Code_AI_V5/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (backend endpoints)
│   ├── auth/              # Authentication pages (login/signup)
│   ├── dashboard/         # User dashboard and stream management
│   ├── discover/          # Browse live streams page
│   ├── stream/            # Individual stream pages
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
│   ├── LiveKitGoLive.tsx # Main streaming component
│   ├── Navigation.tsx     # Top navigation bar
│   ├── StreamCard.tsx     # Stream preview cards
│   └── VideoPlayer.tsx    # Video playback component
├── lib/                   # Utility libraries
│   ├── auth.tsx          # Authentication context
│   ├── storage.ts        # Video storage management
│   └── supabase.ts       # Supabase client configuration
├── docs/                  # Documentation (YOU ARE HERE)
├── public/               # Static assets
├── types/                # TypeScript type definitions
├── .env.local           # Environment variables (create this)
├── docker-compose.yml   # Docker configuration
├── package.json         # Project dependencies
└── README.md            # This file
```

---

## 🆘 Getting Help

**Got stuck? Here's where to get help:**

1. **Documentation Issues:**
   - Check [`docs/GETTING_STARTED_COMPLETE_BEGINNER.md`](docs/GETTING_STARTED_COMPLETE_BEGINNER.md)
   - Read [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)

2. **Technical Problems:**
   - Check GitHub Issues: https://github.com/SFitz911/Vibe-Live-Streaming/issues
   - Search for your error message

3. **Live Help:**
   - Contact Nextwork.org instructors through the platform
   - Email: support@nextwork.org

4. **Community:**
   - Join discussions on GitHub
   - Watch tutorial streams on the platform

---

## 📜 License

This project is open source and available for educational purposes.

---

## 🙏 Acknowledgments

- **Nextwork.org** - Educational content and instruction
- **Supabase** - Backend infrastructure
- **LiveKit** - Real-time streaming technology
- **Render.com** - Hosting platform

---

**Ready to get started?** Choose your path above and dive in! 🚀

**Need help?** Start with [`docs/GETTING_STARTED_COMPLETE_BEGINNER.md`](docs/GETTING_STARTED_COMPLETE_BEGINNER.md) - we'll walk you through everything step by step!
