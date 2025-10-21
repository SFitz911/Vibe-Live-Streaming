import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LiveStreamNotification from '@/components/LiveStreamNotification'
import ExpertHelpNotification from '@/components/ExpertHelpNotification'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vibe Live - Modern Livestreaming Platform',
  description: 'Self-hosted livestreaming platform powered by Supabase and AWS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <LiveStreamNotification isEnabled={true} />
        <ExpertHelpNotification isEnabled={true} />
      </body>
    </html>
  )
}

