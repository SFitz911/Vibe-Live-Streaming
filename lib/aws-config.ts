import { S3Client } from '@aws-sdk/client-s3'
import { IVSClient } from '@aws-sdk/client-ivs'

// AWS S3 Client for storing thumbnails and recordings
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

// AWS IVS Client for live streaming
export const ivsClient = new IVSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export const AWS_CONFIG = {
  s3Bucket: process.env.AWS_S3_BUCKET || '',
  cloudfrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN || '',
  ivsChannelArn: process.env.AWS_IVS_CHANNEL_ARN || '',
  ivsPlaybackUrl: process.env.AWS_IVS_PLAYBACK_URL || '',
  region: process.env.AWS_REGION || 'us-east-1',
}

