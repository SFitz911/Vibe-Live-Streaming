# Deployment Guide for Vibe Live

This guide covers various deployment options for your livestreaming platform.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ Completed AWS setup (IVS, S3, CloudFront)
- ✅ Supabase project configured (database schema applied)
- ✅ All environment variables ready
- ✅ Tested locally with `npm run dev`
- ✅ Built successfully with `npm run build`
- ✅ Removed any test/debug code
- ✅ Set up custom domain (optional)

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest and fastest way to deploy Next.js applications.

#### Step 1: Push to Git

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/vibe-live.git
git push -u origin main
\`\`\`

#### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Step 3: Add Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://zbiwmgtvxlurqyfrzjhd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=vibe-live-assets
AWS_CLOUDFRONT_DOMAIN=d1a2b3c4d5e6f7.cloudfront.net
AWS_IVS_CHANNEL_ARN=your_channel_arn
AWS_IVS_PLAYBACK_URL=your_playback_url
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
\`\`\`

#### Step 4: Deploy

Click **Deploy** and wait for the build to complete (2-3 minutes).

Your app will be live at `https://your-app.vercel.app`!

#### Step 5: Set Up Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

---

### Option 2: Docker

Deploy using Docker containers for maximum flexibility.

#### Step 1: Create Dockerfile

Already included in the project. Verify it exists:

\`\`\`dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
\`\`\`

#### Step 2: Build Docker Image

\`\`\`bash
docker build -t vibe-live:latest .
\`\`\`

#### Step 3: Run Container

\`\`\`bash
docker run -d \\
  --name vibe-live \\
  -p 3000:3000 \\
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \\
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \\
  # ... add all other env vars
  vibe-live:latest
\`\`\`

#### Step 4: Use Docker Compose (Recommended)

Create `docker-compose.yml`:

\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    restart: unless-stopped
\`\`\`

Run with:
\`\`\`bash
docker-compose up -d
\`\`\`

---

### Option 3: AWS (EC2 + Load Balancer)

For full control and scalability.

#### Step 1: Create EC2 Instance

1. Go to EC2 Dashboard
2. Launch instance:
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance type**: t3.medium (minimum)
   - **Storage**: 30 GB
   - **Security group**: Allow ports 22, 80, 443

#### Step 2: Connect and Set Up

\`\`\`bash
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone your repo
git clone https://github.com/yourusername/vibe-live.git
cd vibe-live

# Install dependencies
npm install

# Build
npm run build

# Set up environment variables
nano .env.local
# (paste your environment variables)

# Start with PM2
pm2 start npm --name "vibe-live" -- start
pm2 save
pm2 startup
\`\`\`

#### Step 3: Set Up Nginx

\`\`\`bash
sudo apt install nginx

sudo nano /etc/nginx/sites-available/vibe-live
\`\`\`

Add configuration:

\`\`\`nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

Enable and restart:
\`\`\`bash
sudo ln -s /etc/nginx/sites-available/vibe-live /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

#### Step 4: Set Up SSL with Let's Encrypt

\`\`\`bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
\`\`\`

---

### Option 4: Netlify

Alternative to Vercel with similar ease of use.

#### Steps:

1. Connect your Git repository to Netlify
2. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
3. Add environment variables
4. Deploy!

---

### Option 5: Self-Hosted (DigitalOcean, Linode, etc.)

Similar to AWS EC2 setup:

1. Create a droplet/instance
2. Install Node.js and PM2
3. Clone and build project
4. Set up Nginx reverse proxy
5. Configure SSL with Let's Encrypt

---

## 🔐 Production Environment Variables

Make sure these are set in production:

\`\`\`env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://zbiwmgtvxlurqyfrzjhd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AWS (Required)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=vibe-live-assets
AWS_CLOUDFRONT_DOMAIN=d1234.cloudfront.net
AWS_IVS_CHANNEL_ARN=arn:aws:ivs:...
AWS_IVS_PLAYBACK_URL=https://...

# App Config
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
\`\`\`

## 🎯 Post-Deployment Steps

### 1. Update Supabase Auth Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your production URL:
   - **Site URL**: `https://yourdomain.com`
   - **Redirect URLs**: `https://yourdomain.com/auth/callback`

### 2. Configure CORS in Supabase

Update API settings to allow requests from your domain.

### 3. Update AWS S3 CORS

Update allowed origins in S3 bucket CORS configuration:

\`\`\`json
{
  "AllowedOrigins": ["https://yourdomain.com"]
}
\`\`\`

### 4. Set Up Monitoring

#### Vercel
- Enable Vercel Analytics
- Set up error tracking (Sentry integration)

#### Self-Hosted
- Set up PM2 monitoring: `pm2 monitor`
- Configure log rotation
- Set up CloudWatch or similar

### 5. Set Up Backups

#### Supabase
- Enable Point-in-Time Recovery (paid plans)
- Set up daily backups

#### AWS S3
- Enable versioning
- Set up backup policies

### 6. Performance Optimization

\`\`\`bash
# Enable Next.js cache
# Already configured in next.config.js

# Optimize images
# Using Next.js Image component

# Enable compression in Nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
\`\`\`

## 📊 Monitoring and Analytics

### Application Monitoring

1. **Vercel Analytics** (if using Vercel)
2. **Sentry** for error tracking:
   \`\`\`bash
   npm install @sentry/nextjs
   \`\`\`

3. **LogRocket** for session replay:
   \`\`\`bash
   npm install logrocket
   \`\`\`

### Infrastructure Monitoring

1. **AWS CloudWatch** for AWS services
2. **Supabase Dashboard** for database metrics
3. **UptimeRobot** for uptime monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

\`\`\`yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm test
      # Add deployment steps based on your platform
\`\`\`

## 🆘 Troubleshooting

### Build Fails

- Check all environment variables are set
- Verify Node.js version (18+)
- Run `npm run build` locally first

### App Won't Start

- Check logs: `pm2 logs` or Vercel logs
- Verify database connection
- Check Supabase RLS policies

### Slow Performance

- Enable caching
- Optimize images
- Use CloudFront CDN
- Check database query performance

## 📈 Scaling Considerations

### Horizontal Scaling

- Use multiple EC2 instances behind a load balancer
- Enable Vercel's Edge Functions
- Use Redis for caching (future enhancement)

### Database Scaling

- Enable Supabase connection pooling
- Add read replicas (enterprise plans)
- Optimize indexes

### CDN Optimization

- Use CloudFront for all static assets
- Enable gzip compression
- Set appropriate cache headers

## 🔒 Security Checklist

- ✅ HTTPS enabled
- ✅ Environment variables secured
- ✅ Supabase RLS policies active
- ✅ Rate limiting configured
- ✅ API routes protected
- ✅ CORS properly configured
- ✅ Security headers set
- ✅ Regular dependency updates

## 📝 Maintenance

### Regular Tasks

- **Weekly**: Check logs for errors
- **Monthly**: Update dependencies
- **Quarterly**: Review AWS costs
- **Yearly**: Rotate AWS credentials

### Database Maintenance

\`\`\`sql
-- Vacuum database (Supabase handles this)
-- Archive old chat messages (set up scheduled function)
-- Clean up old stream records
\`\`\`

---

**Your app is now live! 🎉**

Need help? Check the main README or AWS_SETUP.md guides.

