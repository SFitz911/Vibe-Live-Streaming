# Vibe Live - Modern Livestreaming Platform

<div align="center">
  <h3>🎥 Self-Hosted Live Video + Chat Server</h3>
  <p>A modern, Owncast-inspired livestreaming platform built with Next.js, Supabase, and AWS</p>
</div>

## 🌟 Features

- **🎬 Live Streaming**: Full-featured live video streaming powered by AWS IVS (Interactive Video Service)
- **💬 Real-time Chat**: Built-in chat with real-time updates using Supabase Realtime
- **👥 User Management**: Complete authentication and profile system
- **📊 Creator Dashboard**: Analytics, stream management, and viewer insights
- **🎨 Modern UI**: Beautiful, responsive design with Tailwind CSS
- **🔒 Security**: Row Level Security (RLS) policies with Supabase
- **📱 Mobile-Ready**: Fully responsive design for all devices
- **🏷️ Categories & Tags**: Organize streams by category and tags
- **⚡ Fast & Scalable**: Serverless architecture with Next.js and AWS

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful, consistent icons

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Real-time subscriptions
  - Row Level Security
- **AWS Services**
  - **AWS IVS** - Interactive Video Service for live streaming
  - **AWS S3** - Object storage for thumbnails and recordings
  - **AWS CloudFront** - CDN for content delivery

### Libraries
- `@supabase/supabase-js` - Supabase client
- `@aws-sdk/client-s3` - AWS S3 client
- `@aws-sdk/client-ivs` - AWS IVS client
- `video.js` / `hls.js` - Video playback

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account (free tier available)
- An AWS account (for IVS and S3)
- Git installed

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd Vibe_Code_AI_V5
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zbiwmgtvxlurqyfrzjhd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your-livestream-bucket
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net

# AWS IVS (Interactive Video Service)
AWS_IVS_CHANNEL_ARN=arn:aws:ivs:us-east-1:xxxxx:channel/xxxxx
AWS_IVS_PLAYBACK_URL=https://xxxxx.us-east-1.playback.live-video.net

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

**Important**: Your Supabase project is already set up:
- Project ID: `zbiwmgtvxlurqyfrzjhd`
- Project URL: `https://zbiwmgtvxlurqyfrzjhd.supabase.co`
- Database schema has been applied ✅

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

The Supabase database includes the following tables:

- **profiles** - User profiles (extends auth.users)
- **streams** - Stream metadata and settings
- **chat_messages** - Real-time chat messages
- **followers** - User follow relationships
- **stream_views** - Stream analytics and view tracking
- **stream_moderators** - Stream moderation permissions

All tables have Row Level Security (RLS) enabled with appropriate policies.

## 🎯 Key Features Breakdown

### 1. Live Streaming
- AWS IVS integration for low-latency streaming
- Stream key generation
- Start/stop stream controls
- Viewer count tracking
- HLS playback support

### 2. Chat System
- Real-time messaging with Supabase Realtime
- User mentions and moderation tools
- Chat history persistence
- Moderator badges
- Message filtering

### 3. Creator Dashboard
- Stream analytics
- Viewer metrics
- Stream management
- Profile customization
- Follower tracking

### 4. Discovery & Browse
- Category filtering
- Tag-based search
- Live stream indicators
- Trending streams
- Recent streams

## 📱 Pages

- `/` - Home page with live and recent streams
- `/discover` - Browse streams by category
- `/stream/[id]` - Watch stream with chat
- `/dashboard` - Creator dashboard
- `/dashboard/stream/new` - Create new stream
- `/auth/login` - Sign in/Sign up
- `/profile` - User profile (coming soon)

## 🔧 AWS Setup

### AWS IVS (Interactive Video Service)

1. Go to AWS Console → IVS
2. Create a new channel
3. Copy the following:
   - Channel ARN
   - Stream Key (for OBS/streaming software)
   - Playback URL
4. Add to `.env.local`

### AWS S3 Bucket

1. Create a new S3 bucket for thumbnails/recordings
2. Configure CORS settings
3. Set up bucket policy for public read access
4. Add bucket name to `.env.local`

### AWS CloudFront

1. Create CloudFront distribution for S3 bucket
2. Copy distribution domain
3. Add to `.env.local`

See [AWS_SETUP.md](./AWS_SETUP.md) for detailed instructions.

## 🎥 Streaming Setup (OBS)

1. Open OBS Studio
2. Go to Settings → Stream
3. Select "Custom" as Service
4. Server: `rtmps://your-ivs-ingest-endpoint`
5. Stream Key: Your AWS IVS stream key
6. Start streaming!

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Docker

\`\`\`bash
docker build -t vibe-live .
docker run -p 3000:3000 vibe-live
\`\`\`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for more deployment options.

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- JWT-based authentication
- API route protection
- Input validation and sanitization
- Rate limiting (recommended for production)
- CORS configuration

## 🎨 Customization

### Branding
- Update colors in `tailwind.config.js`
- Replace logo/icons in `components/Navigation.tsx`
- Customize theme in `app/globals.css`

### Features
- Add more stream categories in relevant pages
- Extend chat with emojis/reactions
- Add subscription/payment system
- Implement stream recording/VODs

## 📊 Monitoring & Analytics

- Supabase Dashboard for database metrics
- AWS CloudWatch for IVS metrics
- Vercel Analytics for web performance
- Custom analytics with `stream_views` table

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the [AWS_SETUP.md](./AWS_SETUP.md) guide
2. Verify environment variables
3. Check Supabase logs
4. Review AWS IVS channel status

## 🎯 Roadmap

- [ ] Mobile apps (React Native)
- [ ] Stream recording/VOD playback
- [ ] Subscription/monetization system
- [ ] Advanced moderation tools
- [ ] Stream overlay customization
- [ ] Multi-streaming support
- [ ] Vertical short-video feed (TikTok-style)

## 🙏 Acknowledgments

- Inspired by [Owncast](https://owncast.online/)
- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Streaming via [AWS IVS](https://aws.amazon.com/ivs/)

---

**Made with ❤️ for the streaming community**

