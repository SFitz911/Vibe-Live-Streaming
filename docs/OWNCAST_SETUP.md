# 🎥 Owncast Setup Guide

Complete guide to deploy your own streaming server with Owncast.

## 🚀 Quick Start (5 minutes)

### Option 1: Local Development

```bash
# 1. Clone this repository
git clone https://github.com/yourusername/vibe-coding-live.git
cd vibe-coding-live

# 2. Start Owncast with Docker Compose
docker-compose up -d owncast

# 3. Access your streaming server
# Web Interface: http://localhost:8080
# Admin Panel: http://localhost:8080/admin
# RTMP Endpoint: rtmp://localhost:1935/live
```

### Option 2: Production Deployment

```bash
# 1. Deploy to your VPS
docker-compose up -d

# 2. Configure your domain
# Update nginx.conf with your domain name
# Add SSL certificates to ./ssl/ directory

# 3. Access your streaming server
# Web Interface: https://your-domain.com
# Admin Panel: https://your-domain.com/admin
# RTMP Endpoint: rtmp://your-domain.com:1935/live
```

## 🔧 Configuration

### 1. Owncast Admin Setup

1. **Access Admin Panel**
   - Go to `http://localhost:8080/admin` (or your domain)
   - Default login: `admin` / `abc123`
   - Change password immediately!

2. **Configure Stream Settings**
   ```
   Stream Key: [Generate or set custom key]
   Stream Title: Your Live Coding Session
   Description: Educational content about coding and AI
   Category: Technology
   ```

3. **Customize Appearance**
   - Upload your logo
   - Set custom colors
   - Configure chat settings
   - Set up social links

### 2. OBS Studio Configuration

1. **Open OBS Settings**
   - Go to `Settings → Stream`

2. **Configure Stream Settings**
   ```
   Service: Custom
   Server: rtmp://localhost:1935/live (or your domain)
   Stream Key: [Your Owncast stream key]
   ```

3. **Configure Output Settings**
   ```
   Output Mode: Simple
   Video Bitrate: 2500 Kbps
   Audio Bitrate: 128 Kbps
   ```

4. **Configure Video Settings**
   ```
   Base Resolution: 1920x1080
   Output Resolution: 1280x720
   FPS: 30
   ```

### 3. Firewall Configuration

For production deployment, open these ports:

```bash
# Allow HTTP/HTTPS traffic
sudo ufw allow 80
sudo ufw allow 443

# Allow RTMP streaming
sudo ufw allow 1935

# Optional: Allow SSH (if needed)
sudo ufw allow 22
```

## 🌐 Domain & SSL Setup

### 1. Domain Configuration

1. **Update nginx.conf**
   ```nginx
   server_name your-domain.com www.your-domain.com;

   **What is nginx**
   Nginx is an open-source software that can:

Serve static content like HTML, CSS, images, and videos.

Act as a reverse proxy — sitting in front of web apps to route requests to backend servers (like Node.js, Python, or PHP).

Load balance across multiple servers to distribute traffic evenly.

Cache responses for faster performance and reduced load.

Terminate SSL/TLS — handle HTTPS connections before passing requests to other services.


   ```

2. **Update DNS Records**
   ```
   A Record: your-domain.com → YOUR_SERVER_IP
   A Record: www.your-domain.com → YOUR_SERVER_IP
   ```

### 2. SSL Certificate Setup

#### Option A: Let's Encrypt (Free)

```bash
# 1. Install Certbot
sudo apt install certbot

# 2. Generate certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# 3. Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem

# 4. Restart nginx
docker-compose restart nginx
```

#### Option B: Custom SSL

```bash
# 1. Create ssl directory
mkdir ssl

# 2. Add your certificates
# cert.pem (your certificate)
# key.pem (your private key)

# 3. Restart nginx
docker-compose restart nginx
```

## 🔗 Integration with Vibe Coding Live

### 1. Update Stream Creation

When creating a new stream in your platform:

```typescript
// Use Owncast stream URL
const streamData = {
  title: "Live Coding Session",
  description: "Building with AI and cloud technologies",
  playback_url: "https://your-domain.com/hls/stream.m3u8",
  rtmp_url: "rtmp://your-domain.com:1935/live",
  stream_key: "your-stream-key"
}
```

### 2. Update Video Player

The video player will automatically work with Owncast's HLS stream:

```typescript
// HLS stream URL from Owncast
const playbackUrl = "https://your-domain.com/hls/stream.m3u8"
```

### 3. Chat Integration

Owncast has built-in chat, but you can also integrate with your platform's chat system.

## 📊 Monitoring & Maintenance

### 1. View Logs

```bash
# View Owncast logs
docker-compose logs -f owncast

# View nginx logs
docker-compose logs -f nginx
```

### 2. Backup Data

```bash
# Backup Owncast data
docker run --rm -v vibe-coding-live_owncast-data:/data -v $(pwd):/backup alpine tar czf /backup/owncast-backup.tar.gz -C /data .
```

### 3. Update Owncast

```bash
# Pull latest image and restart
docker-compose pull owncast
docker-compose up -d owncast
```

## 🎯 Advanced Configuration

### 1. Custom Stream Key

```bash
# Set custom stream key
docker run -d \
  --name owncast \
  -p 8080:8080 \
  -p 1935:1935 \
  -e OWNCAST_STREAM_KEY=your-custom-key \
  -v owncast-data:/app/data \
  gabekangas/owncast:latest
```

### 2. Multiple Streams

```bash
# Run multiple Owncast instances
docker run -d --name owncast-1 -p 8080:8080 -p 1935:1935 gabekangas/owncast:latest
docker run -d --name owncast-2 -p 8081:8080 -p 1936:1935 gabekangas/owncast:latest
```

### 3. Load Balancing

Use nginx to load balance multiple Owncast instances for high availability.

## 🆘 Troubleshooting

### Common Issues

1. **Stream not starting**
   - Check RTMP URL and stream key
   - Verify firewall settings
   - Check Owncast logs

2. **Video not playing**
   - Verify HLS stream URL
   - Check browser console for errors
   - Ensure Owncast is running

3. **SSL issues**
   - Verify certificate files
   - Check nginx configuration
   - Ensure domain points to server

### Support

- [Owncast Documentation](https://owncast.online/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 🎉 Success!

Your Owncast streaming server is now ready! 

**Next Steps:**
1. Configure OBS Studio with your RTMP settings
2. Start streaming from OBS
3. View your stream at your domain
4. Integrate with your Vibe Coding Live platform

**Happy Streaming! 🎥✨**
