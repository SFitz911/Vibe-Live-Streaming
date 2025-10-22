# 🎥 Vibe Live - Educational Live Streaming Platform

A modern, full-stack live streaming platform built for IT learners and professionals. Share your screen, teach coding, and collaborate in real-time with advanced AI tools and cloud technologies.

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [⚙️ Setup & Installation](#️-setup--installation)
- [🌐 Deployment Options](#-deployment-options)
- [📱 Features](#-features)
- [🔧 Configuration](#-configuration)
- [🎯 Streaming Setup](#-streaming-setup)
- [🔒 Security](#-security)
- [📊 Monitoring & Analytics](#-monitoring--analytics)
- [🆘 Troubleshooting](#-troubleshooting)
- [📚 API Reference](#-api-reference)
- [🤝 Contributing](#-contributing)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- (Optional) AWS Account for production features

### 1-Minute Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/vibe-live-streaming.git
cd vibe-live-streaming

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev

# Open http://localhost:3000
```

## 🏗️ Architecture Overview

### Tech Stack
```
Frontend: Next.js 14 + React 18 + TypeScript
Backend: Next.js API Routes + Supabase
Database: PostgreSQL (via Supabase)
Streaming: OBS Studio + RTMP/YouTube Live/Twitch
Storage: AWS S3 + CloudFront CDN
Authentication: Supabase Auth
Styling: Tailwind CSS + Lucide Icons
```

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   OBS Studio    │───▶│   RTMP Server   │───▶│   Video Player  │
│   (Streamer)    │    │  (YouTube/Twitch)│    │   (Viewers)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │◄───│   Supabase DB   │◄───│   AWS S3/CDN    │
│   (Web Platform)│    │   (User Data)   │    │   (Assets)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Logic Flow
```
User Journey:
1. Visit Homepage → 2. Setup OBS → 3. Create Stream → 4. Go Live → 5. View Stream

Technical Flow:
1. User Authentication (Supabase)
2. Stream Creation (Database)
3. OBS Configuration (RTMP)
4. Live Streaming (External Platform)
5. Stream Viewing (Video Player)
6. Real-time Chat (WebSocket)
```

## ⚙️ Setup & Installation

### Environment Variables
Create `.env.local` with the following:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AWS Configuration (Optional for basic functionality)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.net

# AWS IVS (Optional - for advanced streaming)
AWS_IVS_CHANNEL_ARN=arn:aws:ivs:region:account:channel/channel-id
AWS_IVS_PLAYBACK_URL=https://your-playback-url.m3u8

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Database Setup (Supabase)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy URL and keys to `.env.local`

2. **Run Database Migrations**
   ```sql
   -- Users table (handled by Supabase Auth)
   -- No additional setup needed for basic functionality
   
   -- Optional: Add custom tables for advanced features
   CREATE TABLE IF NOT EXISTS streams (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     title TEXT NOT NULL,
     description TEXT,
     category TEXT,
     tags TEXT[],
     stream_key TEXT,
     playback_url TEXT,
     is_live BOOLEAN DEFAULT false,
     viewer_count INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### Development Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Database
npm run db:reset     # Reset database (if using local setup)
npm run db:seed      # Seed with sample data
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Connect to Vercel
# - Go to vercel.com
# - Import your GitHub repository
# - Add environment variables
# - Deploy automatically
```

### Option 2: Render
```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Connect to Render
# - Go to render.com
# - Create new Web Service
# - Connect GitHub repo
# - Add environment variables
# - Deploy
```

### Option 3: AWS EC2
```bash
# 1. Launch EC2 instance (Ubuntu 22.04)
# 2. Connect via SSH
ssh -i your-key.pem ubuntu@your-instance-ip

# 3. Install dependencies
sudo apt update
sudo apt install nodejs npm nginx
npm install -g pm2

# 4. Clone and setup
git clone https://github.com/yourusername/vibe-live-streaming.git
cd vibe-live-streaming
npm install
npm run build

# 5. Start with PM2
pm2 start npm --name "vibe-live" -- start
pm2 save
pm2 startup
```

## 📱 Features

### Core Features
- ✅ **User Authentication** - Secure login/signup with Supabase
- ✅ **Stream Creation** - Easy stream setup with metadata
- ✅ **OBS Integration** - Step-by-step OBS configuration
- ✅ **Multiple Streaming Platforms** - YouTube Live, Twitch, RTMP
- ✅ **Real-time Chat** - Live chat during streams
- ✅ **Expert Help System** - Contact Nextwork.org experts
- ✅ **Responsive Design** - Works on all devices
- ✅ **Modern UI** - Beautiful, intuitive interface

### Advanced Features
- 🔄 **Stream Management** - Start/stop streams, viewer count
- 📊 **Analytics Dashboard** - Stream performance metrics
- 🎥 **Video Recording** - Save streams for later viewing
- 🔔 **Notifications** - Real-time alerts and updates
- 👥 **User Profiles** - Customizable user profiles
- 🏷️ **Categories & Tags** - Organize content
- 🔍 **Search & Discovery** - Find streams easily

### Technical Features
- ⚡ **Fast Performance** - Optimized for speed
- 🔒 **Secure** - Industry-standard security
- 📱 **Mobile-First** - Responsive design
- 🌐 **SEO Optimized** - Search engine friendly
- 🎨 **Customizable** - Easy to modify and extend

## 🔧 Configuration

### OBS Studio Setup

1. **Download OBS Studio**
   - Visit [obsproject.com](https://obsproject.com/download)
   - Download for your operating system
   - Install and launch

2. **Configure Stream Settings**
   ```
   Settings → Stream:
   - Service: Custom
   - Server: [Your RTMP URL]
   - Stream Key: [Your Stream Key]
   ```

3. **Configure Output Settings**
   ```
   Settings → Output:
   - Output Mode: Simple
   - Video Bitrate: 2500 Kbps
   - Audio Bitrate: 128 Kbps
   ```

4. **Configure Video Settings**
   ```
   Settings → Video:
   - Base Resolution: 1920x1080
   - Output Resolution: 1280x720
   - FPS: 30
   ```

### Streaming Platform Options

#### YouTube Live (Recommended)
- **Pros**: Free, unlimited viewers, built-in chat, recording
- **Setup**: 
  1. Go to [YouTube Studio](https://studio.youtube.com)
  2. Create → Go Live
  3. Copy Stream Key
  4. Use RTMP URL: `rtmp://a.rtmp.youtube.com/live2`

#### Twitch
- **Pros**: Large community, good discoverability
- **Setup**:
  1. Go to [Twitch Creator Dashboard](https://dashboard.twitch.tv)
  2. Settings → Stream
  3. Copy Stream Key
  4. Use RTMP URL: `rtmp://live.twitch.tv/live`

#### Free RTMP Server
- **Pros**: Full control, no platform restrictions
- **Setup**: Use services like [Restream.io](https://restream.io) or self-host

## 🎯 Streaming Setup

### For Streamers

1. **Install OBS Studio**
   ```bash
   # Download from obsproject.com
   # Follow installation instructions for your OS
   ```

2. **Configure OBS**
   - Open OBS Studio
   - Go to Settings → Stream
   - Select "Custom" service
   - Enter your RTMP server and stream key
   - Configure video/audio settings

3. **Add Sources**
   - **Display Capture**: Share your screen
   - **Video Capture Device**: Add webcam
   - **Audio Input Capture**: Add microphone

4. **Start Streaming**
   - Click "Start Streaming" in OBS
   - Your stream will appear on your chosen platform
   - Share the stream URL with viewers

### For Viewers

1. **Watch Streams**
   - Browse live streams on the homepage
   - Click on any stream to watch
   - Use chat to interact with streamer

2. **Chat Features**
   - Real-time messaging
   - Expert help requests
   - Stream interactions

## 🔒 Security

### Authentication
- **Supabase Auth**: Industry-standard authentication
- **JWT Tokens**: Secure session management
- **Row Level Security**: Database-level access control

### Data Protection
- **Environment Variables**: All secrets in environment
- **HTTPS Only**: Encrypted connections
- **CORS Configuration**: Proper cross-origin settings
- **Input Validation**: Sanitized user inputs

### Best Practices
```bash
# Never commit secrets
echo ".env.local" >> .gitignore
echo "*.key" >> .gitignore

# Use strong passwords
# Enable 2FA on all accounts
# Regular security updates
```

## 📊 Monitoring & Analytics

### Built-in Analytics
- **Stream Performance**: Viewer count, duration, engagement
- **User Activity**: Login patterns, feature usage
- **Error Tracking**: Automatic error logging

### External Tools
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: Detailed user analytics

### Health Checks
```bash
# Check application health
curl http://localhost:3000/api/health

# Check database connection
curl http://localhost:3000/api/db/status

# Check streaming status
curl http://localhost:3000/api/streams/status
```

## 🆘 Troubleshooting

### Common Issues

#### Stream Not Starting
```bash
# Check OBS settings
1. Verify RTMP URL is correct
2. Check stream key is valid
3. Ensure internet connection is stable
4. Try different streaming platform
```

#### Chat Not Working
```bash
# Check authentication
1. Ensure user is logged in
2. Check Supabase connection
3. Verify WebSocket connection
4. Clear browser cache
```

#### Video Not Playing
```bash
# Check video player
1. Verify playback URL is valid
2. Check browser compatibility
3. Try different browser
4. Check network connection
```

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development npm run dev

# Check logs
tail -f logs/app.log

# Database queries
# Check Supabase dashboard for query logs
```

### Performance Issues
```bash
# Check system resources
htop                    # CPU/Memory usage
df -h                   # Disk space
netstat -tulpn          # Network connections

# Optimize database
# Check slow queries in Supabase dashboard
# Add database indexes if needed
```

## 📚 API Reference

### Authentication Endpoints
```typescript
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

### Stream Endpoints
```typescript
GET    /api/streams           # List all streams
POST   /api/streams/create    # Create new stream
GET    /api/streams/[id]      # Get stream details
PUT    /api/streams/[id]      # Update stream
DELETE /api/streams/[id]      # Delete stream
```

### Chat Endpoints
```typescript
GET    /api/chat/[streamId]   # Get chat messages
POST   /api/chat              # Send message
DELETE /api/chat/[id]         # Delete message
```

### File Upload Endpoints
```typescript
POST   /api/upload/thumbnail  # Upload stream thumbnail
POST   /api/upload/avatar     # Upload user avatar
```

## 🤝 Contributing

### Development Setup
```bash
# Fork the repository
git clone https://github.com/yourusername/vibe-live-streaming.git
cd vibe-live-streaming

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm run dev
npm run test

# Commit changes
git add .
git commit -m "Add your feature"
git push origin feature/your-feature-name

# Create pull request
```

### Code Standards
- **TypeScript**: Use strict typing
- **ESLint**: Follow configured rules
- **Prettier**: Consistent code formatting
- **Testing**: Write tests for new features
- **Documentation**: Update docs for changes

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/          # Dashboard pages
│   └── stream/            # Stream pages
├── components/            # React components
├── lib/                   # Utility functions
├── types/                 # TypeScript types
└── public/               # Static assets
```

## 📞 Support

### Getting Help
- **Documentation**: Check this README first
- **Issues**: Create GitHub issue for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact support@nextwork.org

### Community
- **Discord**: Join our developer community
- **Twitter**: Follow @nextworkorg for updates
- **Blog**: Read our technical blog posts

---

## 🎉 Success!

Your Vibe Live streaming platform is now ready! 

**Next Steps:**
1. Deploy to your chosen platform
2. Set up your streaming configuration
3. Start creating amazing educational content
4. Build your community of learners

**Happy Streaming! 🎥✨**

---

*Built with ❤️ by the Nextwork.org team*