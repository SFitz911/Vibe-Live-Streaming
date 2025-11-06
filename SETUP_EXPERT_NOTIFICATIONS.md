# 📧💬 Expert Notification Setup Guide

## Overview

The expert notification system sends **emails** and **SMS text messages** to Nextwork.org instructors when students need help during live streams.

---

## 🔧 Services Required

### 1. **Resend** (Email Notifications)
- **Cost:** FREE (100 emails/day, 3,000/month)
- **Why:** Simple, reliable email API

### 2. **Twilio** (SMS Notifications)  
- **Cost:** Pay-as-you-go (~$0.0075/SMS)
- **Why:** Industry standard for SMS

---

## 📝 Step 1: Get Resend API Key (Email)

### **A. Sign Up for Resend**
1. Go to: https://resend.com/
2. Click **"Sign Up"**
3. Verify your email

### **B. Get API Key**
1. Go to: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Name it: `Vibe Coding Live Notifications`
4. **Copy the API key** (you'll only see it once)

### **C. Add Domain (Optional but Recommended)**
1. Go to: https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain: `vibecoding.live` (or whatever you own)
4. Follow DNS setup instructions
5. **OR** use Resend's testing domain for now

---

## 📱 Step 2: Get Twilio Credentials (SMS)

### **A. Sign Up for Twilio**
1. Go to: https://www.twilio.com/try-twilio
2. Sign up for free trial
3. Verify your email and phone number
4. You'll get **$15 in free credit**

### **B. Get Phone Number**
1. Go to: https://console.twilio.com/
2. Click **"Get a Trial Number"**
3. Accept the assigned number (or choose a different one)
4. **Copy the phone number** (format: `+1234567890`)

### **C. Get API Credentials**
1. Go to: https://console.twilio.com/
2. Find **"Account Info"** panel on dashboard
3. Copy these 3 values:
   - **Account SID**
   - **Auth Token**
   - **Phone Number** (from step B)

---

## 🔑 Step 3: Add Environment Variables

### **Local Development** (`.env.local`)

Open `.env.local` and add:

```bash
# ================================
# Expert Notifications (Resend + Twilio)
# ================================

# Resend (Email)
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Twilio (SMS)
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

---

### **Production** (Render.com)

1. Go to: https://dashboard.render.com/
2. Select your service: **Vibe-Live-Streaming**
3. Click **"Environment"** (left sidebar)
4. Add these 4 variables:

```
Key: RESEND_API_KEY
Value: re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

Key: TWILIO_ACCOUNT_SID
Value: ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

Key: TWILIO_AUTH_TOKEN
Value: your_auth_token_here

Key: TWILIO_PHONE_NUMBER
Value: +1234567890
```

5. Click **"Save Changes"**
6. Click **"Manual Deploy" → "Clear build cache & deploy"**

---

## ✅ Step 4: Test Notifications

### **Test Locally:**

1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000
3. Join any stream
4. Look for **"Get help from a Nextwork.org expert"** button (yellow button in chat sidebar)
5. Click it and select an expert (e.g., Natasha)
6. Click **Send**

**Expected Result:**
- ✅ Alert: "Expert has been notified!"
- ✅ Email sent to expert's email
- ✅ SMS sent to expert's phone
- ✅ Expert sees notification popup (if they're logged in)

---

### **Test on Production:**

1. Go to: https://vibe-live-streaming.onrender.com/
2. Join a live stream
3. Click **"Get help from a Nextwork.org expert"**
4. Select an expert
5. Should send email + SMS

---

## 📊 What Gets Sent?

### **Email Content:**
```
Subject: ⚠️ Help Request from [Student Name]

Hi Natasha,

A student needs your help!

Request Details:
- Priority: MEDIUM
- From: John Student (john@example.com)
- Topic: Help needed on: AWS Cloud Architecture
- Stream: [Link to live stream]

[Button: Join Stream & Help]
```

### **SMS Content:**
```
⚠️ VIBE LIVE HELP REQUEST

From: John Student
Topic: Help needed on: AWS Cloud Architecture
Priority: MEDIUM

https://vibe-live-streaming.onrender.com/stream/123
```

---

## 🎛️ Urgency Levels

The system supports 3 urgency levels:

| Level | Email | SMS | Sound Alert |
|-------|-------|-----|-------------|
| **Low** 💡 | ✅ | ✅ | 2 beeps |
| **Medium** ⚠️ | ✅ | ✅ | 4 beeps |
| **High** 🚨 | ✅ | ✅ | 6 beeps + siren |

Currently hardcoded to **MEDIUM** but can be customized later.

---

## 💰 Cost Breakdown

### **Free Tier Usage:**

**Resend (Email):**
- 100 emails/day = **FREE**
- 3,000 emails/month = **FREE**
- More than that? ~$10/month for 50k emails

**Twilio (SMS):**
- Trial: $15 credit = ~2,000 SMS
- After trial: ~$0.0075/SMS
- 100 notifications/day = ~$22.50/month

### **Monthly Cost Estimate:**
- Resend: **$0** (under 3,000 emails)
- Twilio: **$22.50** (100 SMS/day = 3,000/month)
- **Total: ~$22.50/month**

---

## 🐛 Troubleshooting

### **"Email notification failed"**
- ✅ Check `RESEND_API_KEY` is set
- ✅ API key is correct (starts with `re_`)
- ✅ Check Resend dashboard for errors
- ✅ Verify sender email domain

### **"SMS notification failed"**
- ✅ Check all 3 Twilio variables are set
- ✅ Phone number format: `+1234567890` (include +)
- ✅ Check Twilio console for errors
- ✅ Verify you have credit left

### **"No notification received"**
- ✅ Check expert email/phone in code (`EXPERTS` array)
- ✅ Check browser console for errors
- ✅ Verify API routes deployed correctly
- ✅ Check Render logs for API errors

---

## 🔧 Optional: Database Tracking

The system tries to log notifications in the database. To enable full tracking:

**Run this SQL in Supabase:**

```sql
CREATE TABLE IF NOT EXISTS public.expert_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_email TEXT NOT NULL,
  expert_name TEXT,
  requester_name TEXT,
  requester_email TEXT,
  topic TEXT NOT NULL,
  urgency TEXT DEFAULT 'medium',
  stream_id TEXT,
  email_sent BOOLEAN DEFAULT false,
  sms_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.expert_notifications ENABLE ROW LEVEL SECURITY;

-- Allow inserts (for logging)
CREATE POLICY "Allow all inserts" 
  ON public.expert_notifications FOR INSERT 
  WITH CHECK (true);

-- Allow reads (for analytics)
CREATE POLICY "Allow all reads" 
  ON public.expert_notifications FOR SELECT 
  USING (true);
```

---

## 🎯 Expert Dashboard (Future Enhancement)

You could add an expert dashboard showing:
- Total help requests
- Response time
- Most common topics
- Student satisfaction ratings

This would use the `expert_notifications` table.

---

## ✅ Summary Checklist

- [ ] Sign up for Resend
- [ ] Get Resend API key
- [ ] Sign up for Twilio
- [ ] Get Twilio phone number + credentials
- [ ] Add 4 environment variables locally
- [ ] Add 4 environment variables to Render
- [ ] Deploy to Render
- [ ] Test locally
- [ ] Test on production
- [ ] (Optional) Run SQL to enable tracking

---

**Questions? The system will fallback to opening email client if API fails, so it's always functional even without API keys!**

