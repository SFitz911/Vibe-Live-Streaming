import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const {
      expertEmail,
      expertPhone,
      expertName,
      requesterName,
      requesterEmail,
      topic,
      urgency,
      streamId,
      streamUrl,
    } = await request.json()

    // Validate required fields
    if (!expertEmail || !requesterName || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const notifications: { email?: any; sms?: any } = {}

    // Send Email using Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Vibe Coding Live <notifications@vibecoding.live>',
            to: [expertEmail],
            subject: `${urgency === 'high' ? '🚨 URGENT' : '⚠️'} Help Request from ${requesterName}`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: ${urgency === 'high' ? '#dc2626' : urgency === 'medium' ? '#ea580c' : '#2563eb'}; color: white; padding: 20px; border-radius: 8px; }
                    .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
                    .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
                    .urgency { background: ${urgency === 'high' ? '#fee2e2' : urgency === 'medium' ? '#ffedd5' : '#dbeafe'}; padding: 10px; border-radius: 6px; margin: 10px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>${urgency === 'high' ? '🚨' : urgency === 'medium' ? '⚠️' : '💡'} Help Request</h1>
                      <p>Hi ${expertName},</p>
                      <p>A student needs your help!</p>
                    </div>
                    
                    <div class="content">
                      <h2>Request Details:</h2>
                      
                      <div class="urgency">
                        <strong>Priority:</strong> ${urgency.toUpperCase()}
                      </div>
                      
                      <p><strong>From:</strong> ${requesterName}</p>
                      ${requesterEmail ? `<p><strong>Email:</strong> ${requesterEmail}</p>` : ''}
                      <p><strong>Topic:</strong> ${topic}</p>
                      ${streamUrl ? `<p><strong>Stream:</strong> <a href="${streamUrl}">${streamUrl}</a></p>` : ''}
                      
                      ${streamUrl ? `<a href="${streamUrl}" class="button">Join Stream & Help</a>` : ''}
                    </div>
                    
                    <p style="margin-top: 20px; color: #666; font-size: 14px;">
                      This notification was sent from Vibe Coding Live - Nextwork.org
                    </p>
                  </div>
                </body>
              </html>
            `,
          }),
        })

        const emailData = await emailResponse.json()
        notifications.email = emailData
      } catch (emailError) {
        console.error('Email notification failed:', emailError)
        notifications.email = { error: 'Failed to send email' }
      }
    }

    // Send SMS using Twilio
    if (expertPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const urgencyEmoji = urgency === 'high' ? '🚨' : urgency === 'medium' ? '⚠️' : '💡'
        const message = `${urgencyEmoji} VIBE LIVE HELP REQUEST\n\nFrom: ${requesterName}\nTopic: ${topic}\nPriority: ${urgency.toUpperCase()}\n\n${streamUrl || 'Check Vibe Coding Live dashboard'}`

        const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')

        const smsResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${auth}`,
            },
            body: new URLSearchParams({
              To: expertPhone,
              From: process.env.TWILIO_PHONE_NUMBER,
              Body: message,
            }),
          }
        )

        const smsData = await smsResponse.json()
        notifications.sms = smsData
      } catch (smsError) {
        console.error('SMS notification failed:', smsError)
        notifications.sms = { error: 'Failed to send SMS' }
      }
    }

    // Store notification in database for tracking
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        await supabase.from('expert_notifications').insert({
          expert_email: expertEmail,
          expert_name: expertName,
          requester_name: requesterName,
          requester_email: requesterEmail,
          topic,
          urgency,
          stream_id: streamId,
          email_sent: !!notifications.email?.id,
          sms_sent: !!notifications.sms?.sid,
        })
      } catch (dbError) {
        console.error('Failed to log notification:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      notifications,
      message: 'Expert notified successfully',
    })
  } catch (error) {
    console.error('Error sending expert notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

