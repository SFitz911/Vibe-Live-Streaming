'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import { AlertCircle, Camera, Wifi, Volume2, Video, CheckCircle, XCircle, HelpCircle, RefreshCw, Settings, Chrome, Globe } from 'lucide-react'
import Link from 'next/link'

export default function TroubleshootingPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Help & Troubleshooting
          </h1>
          <p className="text-gray-400 text-lg">
            Having issues? Find solutions to common problems below
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link href="/stream/demo-live" className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg p-6 transition-colors text-center">
            <Video className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-1">Try Go Live</h3>
            <p className="text-sm text-gray-400">Test your camera and stream</p>
          </Link>
          <Link href="/discover" className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg p-6 transition-colors text-center">
            <Globe className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-1">Watch Streams</h3>
            <p className="text-sm text-gray-400">See live streams from others</p>
          </Link>
          <a href="https://nextwork.org" target="_blank" rel="noopener noreferrer" className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg p-6 transition-colors text-center">
            <HelpCircle className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-1">Contact Support</h3>
            <p className="text-sm text-gray-400">Get help from Nextwork team</p>
          </a>
        </div>

        {/* Common Issues */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
            Common Issues & Solutions
          </h2>

          {/* Camera Not Working */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <button
              onClick={() => toggleSection('camera')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Camera className="h-5 w-5 text-red-500" />
                <span className="text-lg font-semibold text-white">Camera Not Working / Blocked</span>
              </div>
              <span className="text-gray-400">{expandedSection === 'camera' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'camera' && (
              <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Solution 1: Allow Camera Permissions
                    </h4>
                    <ol className="text-gray-300 space-y-2 ml-6 list-decimal">
                      <li>Look at your browser's address bar</li>
                      <li>Click the <strong>camera icon</strong> (may have a red X through it)</li>
                      <li>Change Camera to <strong>"Allow"</strong></li>
                      <li>Change Microphone to <strong>"Allow"</strong></li>
                      <li>Refresh the page (Ctrl+F5)</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Solution 2: Check Browser Settings
                    </h4>
                    <ol className="text-gray-300 space-y-2 ml-6 list-decimal">
                      <li>Open browser Settings → Privacy & Security → Site Settings</li>
                      <li>Click "Camera" and make sure it's not blocked</li>
                      <li>Click "Microphone" and make sure it's not blocked</li>
                      <li>Add localhost:3000 to allowed sites</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Solution 3: Check System Permissions
                    </h4>
                    <ul className="text-gray-300 space-y-2 ml-6 list-disc">
                      <li><strong>Windows:</strong> Settings → Privacy → Camera → Allow apps to access camera</li>
                      <li><strong>Mac:</strong> System Preferences → Security & Privacy → Camera → Check browser</li>
                      <li>Make sure no other app is using your camera</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stream Won't Start */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <button
              onClick={() => toggleSection('stream-start')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Video className="h-5 w-5 text-orange-500" />
                <span className="text-lg font-semibold text-white">"Failed to Create Stream" Error</span>
              </div>
              <span className="text-gray-400">{expandedSection === 'stream-start' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'stream-start' && (
              <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Solution: Check Connection & Reload
                    </h4>
                    <ol className="text-gray-300 space-y-2 ml-6 list-decimal">
                      <li>Make sure you're connected to the internet</li>
                      <li>Refresh the page (Ctrl+F5 or Cmd+R)</li>
                      <li>Clear browser cache and cookies</li>
                      <li>Try a different browser (Chrome recommended)</li>
                      <li>Check if the dev server is running (localhost:3000 should load)</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Poor Video Quality */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <button
              onClick={() => toggleSection('quality')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Wifi className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-semibold text-white">Poor Video Quality / Lag</span>
              </div>
              <span className="text-gray-400">{expandedSection === 'quality' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'quality' && (
              <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Solutions for Better Quality
                    </h4>
                    <ul className="text-gray-300 space-y-2 ml-6 list-disc">
                      <li>Use a wired ethernet connection instead of WiFi</li>
                      <li>Close other programs using bandwidth (downloads, other streams)</li>
                      <li>Make sure you have good lighting for your camera</li>
                      <li>Close unused browser tabs and applications</li>
                      <li>Use Chrome or Edge (best browser support)</li>
                      <li>Check your internet speed (need at least 5 Mbps upload)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Audio Issues */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <button
              onClick={() => toggleSection('audio')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Volume2 className="h-5 w-5 text-purple-500" />
                <span className="text-lg font-semibold text-white">No Audio / Microphone Not Working</span>
              </div>
              <span className="text-gray-400">{expandedSection === 'audio' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'audio' && (
              <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Fix Microphone Issues
                    </h4>
                    <ol className="text-gray-300 space-y-2 ml-6 list-decimal">
                      <li>Check microphone is plugged in properly</li>
                      <li>Allow microphone permissions in browser</li>
                      <li>Toggle "Mic On" button in the stream controls</li>
                      <li>Select correct microphone in system settings</li>
                      <li>Test microphone in other apps to verify it works</li>
                      <li>Make sure microphone isn't muted in Windows/Mac sound settings</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Browser Compatibility */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <button
              onClick={() => toggleSection('browser')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Chrome className="h-5 w-5 text-blue-500" />
                <span className="text-lg font-semibold text-white">Browser Compatibility Issues</span>
              </div>
              <span className="text-gray-400">{expandedSection === 'browser' ? '−' : '+'}</span>
            </button>
            {expandedSection === 'browser' && (
              <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Recommended Browsers</h4>
                    <ul className="text-gray-300 space-y-2 ml-6 list-disc">
                      <li><strong className="text-green-500">✓ Chrome</strong> - Best performance</li>
                      <li><strong className="text-green-500">✓ Edge</strong> - Excellent support</li>
                      <li><strong className="text-green-500">✓ Firefox</strong> - Good support</li>
                      <li><strong className="text-yellow-500">⚠ Safari</strong> - Limited features</li>
                      <li><strong className="text-red-500">✗ Internet Explorer</strong> - Not supported</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">If Using Safari:</h4>
                    <ul className="text-gray-300 space-y-2 ml-6 list-disc">
                      <li>Enable camera permissions in Safari preferences</li>
                      <li>Some features may not work - try Chrome instead</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-800/50 p-8 text-center">
          <HelpCircle className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Still Need Help?</h2>
          <p className="text-gray-300 mb-6">
            Our Nextwork.org support team is here to help you get streaming!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://nextwork.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Nextwork Support
            </a>
            <Link 
              href="/stream/demo-live"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Streaming Again
            </Link>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
            <h3 className="text-white font-semibold mb-2">Best Practices</h3>
            <ul className="text-gray-300 text-sm space-y-1 list-disc ml-5">
              <li>Use Google Chrome for best results</li>
              <li>Have at least 5 Mbps upload speed</li>
              <li>Good lighting improves video quality</li>
              <li>Close unnecessary programs</li>
              <li>Test before going live publicly</li>
            </ul>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <Settings className="h-8 w-8 text-blue-500 mb-3" />
            <h3 className="text-white font-semibold mb-2">Quick Checks</h3>
            <ul className="text-gray-300 text-sm space-y-1 list-disc ml-5">
              <li>Camera permissions allowed?</li>
              <li>Microphone permissions allowed?</li>
              <li>Using recommended browser?</li>
              <li>Internet connection stable?</li>
              <li>No other app using camera?</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
