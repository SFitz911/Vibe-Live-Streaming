# AWS Setup Guide for Vibe Live

This guide will walk you through setting up the required AWS services for your livestreaming platform.

## 📋 Overview

You'll need to set up three main AWS services:
1. **AWS IVS** (Interactive Video Service) - For live streaming
2. **AWS S3** - For storing thumbnails and recordings
3. **AWS CloudFront** - For CDN and fast content delivery

## 🎥 AWS IVS Setup

AWS IVS is a managed live streaming solution that makes it easy to broadcast live video.

### Step 1: Create an IVS Channel

1. Sign in to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **AWS IVS** (search for "IVS" in the services search)
3. Click **Create channel**

### Step 2: Configure Channel Settings

- **Channel name**: `vibe-live-main` (or your preferred name)
- **Channel type**: `STANDARD` (for production) or `BASIC` (for testing)
- **Latency mode**: `LOW` (3-5 second latency) recommended
- **Recording**: Enable if you want to save streams
- **Tags**: Add any organizational tags

Click **Create channel**

### Step 3: Get Channel Details

After creation, you'll see:

1. **Channel ARN**: 
   \`\`\`
   arn:aws:ivs:us-east-1:123456789012:channel/AbCdEfGhIjKl
   \`\`\`
   Add this to `AWS_IVS_CHANNEL_ARN` in your `.env.local`

2. **Ingest endpoint** (RTMPS):
   \`\`\`
   rtmps://a1b2c3d4e5f6.global-contribute.live-video.net:443/app/
   \`\`\`

3. **Stream key**: (Keep this secret!)
   \`\`\`
   sk_us-east-1_AbCdEfGhIjKlMnOpQrStUvWxYz
   \`\`\`
   Store this securely - you'll use it in OBS

4. **Playback URL**:
   \`\`\`
   https://a1b2c3d4e5f6.us-east-1.playback.live-video.net/api/video/v1/us-east-1.123456789012.channel.AbCdEfGhIjKl.m3u8
   \`\`\`
   Add this to `AWS_IVS_PLAYBACK_URL`

### Step 4: (Optional) Set Up Recording

If you want to save streams:

1. In your IVS channel settings, enable **Recording**
2. Create an S3 bucket for recordings: `vibe-live-recordings`
3. Set up lifecycle policies to manage storage costs

## 📦 AWS S3 Setup

S3 will store thumbnails, user avatars, and stream recordings.

### Step 1: Create S3 Bucket

1. Navigate to **S3** in AWS Console
2. Click **Create bucket**
3. **Bucket name**: `vibe-live-assets` (must be globally unique)
4. **Region**: Same as your IVS channel (e.g., `us-east-1`)
5. **Block Public Access**: Uncheck (we'll configure specific permissions)
6. Click **Create bucket**

### Step 2: Configure CORS

1. Go to your bucket → **Permissions** tab
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Click **Edit** and add:

\`\`\`json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
\`\`\`

### Step 3: Set Up Bucket Policy

1. Go to **Permissions** → **Bucket policy**
2. Add this policy (replace `vibe-live-assets` with your bucket name):

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::vibe-live-assets/thumbnails/*"
    },
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::vibe-live-assets/avatars/*"
    }
  ]
}
\`\`\`

This allows public read access to thumbnails and avatars only.

### Step 4: Create Folder Structure

Create these prefixes (folders) in your bucket:
- `thumbnails/`
- `avatars/`
- `recordings/` (if using)

## 🌐 AWS CloudFront Setup

CloudFront provides fast content delivery worldwide.

### Step 1: Create Distribution

1. Navigate to **CloudFront** in AWS Console
2. Click **Create distribution**
3. **Origin domain**: Select your S3 bucket
4. **Origin path**: Leave empty
5. **Name**: `vibe-live-cdn`

### Step 2: Configure Settings

- **Viewer protocol policy**: `Redirect HTTP to HTTPS`
- **Allowed HTTP methods**: `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
- **Cache policy**: `CachingOptimized`
- **Price class**: Choose based on your audience
- **Alternate domain name (CNAME)**: Your custom domain (optional)

Click **Create distribution**

### Step 3: Get CloudFront URL

After creation (takes 5-10 minutes), copy the **Distribution domain name**:
\`\`\`
d1a2b3c4d5e6f7.cloudfront.net
\`\`\`

Add this to `AWS_CLOUDFRONT_DOMAIN` in `.env.local`

## 🔑 IAM User Setup

Create an IAM user for programmatic access.

### Step 1: Create IAM User

1. Navigate to **IAM** → **Users** → **Create user**
2. **User name**: `vibe-live-app`
3. **Access type**: ✅ Programmatic access
4. Click **Next: Permissions**

### Step 2: Set Permissions

Option A - Attach policies directly:
- `AmazonIVSFullAccess`
- `AmazonS3FullAccess`

Option B - Create custom policy (recommended for production):

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ivs:GetChannel",
        "ivs:GetStreamKey",
        "ivs:StopStream",
        "ivs:ListStreams"
      ],
      "Resource": "arn:aws:ivs:*:*:channel/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::vibe-live-assets/*"
    }
  ]
}
\`\`\`

### Step 3: Save Credentials

After creation, you'll see:
- **Access Key ID**: `AKIAIOSFODNN7EXAMPLE`
- **Secret Access Key**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

⚠️ **Important**: Save these immediately! You won't be able to see the secret again.

Add these to your `.env.local`:
\`\`\`
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
\`\`\`

## ✅ Final Configuration

Your `.env.local` should now have all AWS values:

\`\`\`env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=vibe-live-assets
AWS_CLOUDFRONT_DOMAIN=d1a2b3c4d5e6f7.cloudfront.net

# AWS IVS
AWS_IVS_CHANNEL_ARN=arn:aws:ivs:us-east-1:123456789012:channel/AbCdEfGhIjKl
AWS_IVS_PLAYBACK_URL=https://a1b2c3d4e5f6.us-east-1.playback.live-video.net/api/video/v1/...
\`\`\`

## 🎥 Testing Your Setup

### Test with OBS Studio

1. Download [OBS Studio](https://obsproject.com/)
2. Go to **Settings** → **Stream**
3. **Service**: Custom
4. **Server**: Your IVS ingest endpoint
5. **Stream Key**: Your IVS stream key
6. Click **Start Streaming**
7. Open your app at `http://localhost:3000/stream/[your-stream-id]`

## 💰 Cost Estimation

### AWS IVS Pricing (as of 2024)
- **Input**: ~$0.60 per hour
- **Output**: ~$0.015 per GB delivered
- **Recording**: S3 storage costs

### Typical Monthly Costs
- **Light usage** (10 hours): ~$10-20
- **Moderate usage** (50 hours): ~$50-100
- **Heavy usage** (200 hours): ~$200-400

**Tip**: Use AWS Cost Explorer and set up billing alerts!

## 🔒 Security Best Practices

1. **Rotate credentials regularly**
2. **Use IAM roles** instead of access keys when possible
3. **Enable MFA** on AWS account
4. **Monitor CloudWatch logs**
5. **Set up AWS Budget alerts**
6. **Never commit** AWS credentials to git
7. **Use environment variables** for all secrets

## 🆘 Troubleshooting

### Stream not starting?
- Check IVS channel status in AWS Console
- Verify stream key is correct
- Ensure OBS settings match IVS requirements

### Can't upload to S3?
- Verify IAM permissions
- Check CORS configuration
- Confirm bucket policy is correct

### CloudFront not serving files?
- Wait 10-15 minutes after creation
- Check distribution status is "Deployed"
- Verify origin settings

## 📚 Additional Resources

- [AWS IVS Documentation](https://docs.aws.amazon.com/ivs/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [OBS Studio Guide](https://obsproject.com/wiki/)

---

Need help? Check the main README or open an issue!

