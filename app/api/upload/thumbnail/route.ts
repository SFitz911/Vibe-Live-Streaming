import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, AWS_CONFIG } from '@/lib/aws-config'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const streamId = formData.get('streamId') as string

    if (!file || !streamId) {
      return NextResponse.json(
        { error: 'File and streamId are required' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const filename = `thumbnails/${streamId}-${Date.now()}.${file.name.split('.').pop()}`

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: AWS_CONFIG.s3Bucket,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)

    // Generate CloudFront URL
    const thumbnailUrl = `https://${AWS_CONFIG.cloudfrontDomain}/${filename}`

    return NextResponse.json({ thumbnailUrl }, { status: 200 })
  } catch (error) {
    console.error('Error uploading thumbnail:', error)
    return NextResponse.json(
      { error: 'Failed to upload thumbnail' },
      { status: 500 }
    )
  }
}

