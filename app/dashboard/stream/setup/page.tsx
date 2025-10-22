'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Video, Settings, ExternalLink, Copy, Check, Download, Monitor, Camera, Mic } from 'lucide-react'

export default function StreamSetupPage() {
  const router = useRouter()
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(item)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const streamingOptions = [
    {
      name: 'Owncast (Recommended)',
      free: true,
      description: 'Self-hosted streaming platform with complete control',
      rtmpUrl: 'rtmp://localhost:1935/live',
      streamKey: 'jG4zyBNOuBd*KRqN*tzVIgtT32o4HM',
      setupUrl: 'http://your-owncast-server.com:8080/admin',
      pros: ['Complete control', 'No platform restrictions', 'Custom branding', 'Built-in chat', 'Free'],
      cons: ['Requires server setup', 'Need to handle scaling']
    },
    {
      name: 'YouTube Live',
      free: true,
      description: 'Free streaming with unlimited viewers',
      rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
      streamKey: 'YOUR_YOUTUBE_STREAM_KEY',
      setupUrl: 'https://www.youtube.com/live_dashboard',
      pros: ['Unlimited viewers', 'Free', 'Built-in chat', 'Recording'],
      cons: ['Requires YouTube account', 'Content policies apply']
    },
    {
      name: 'Twitch',
      free: true,
      description: 'Popular gaming and creative streaming platform',
      rtmpUrl: 'rtmp://live.twitch.tv/live',
      streamKey: 'YOUR_TWITCH_STREAM_KEY',
      setupUrl: 'https://dashboard.twitch.tv/settings/stream',
      pros: ['Large community', 'Free', 'Good discoverability'],
      cons: ['Gaming-focused', 'Requires Twitch account']
    }
  ]

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            OBS Streaming Setup
          </h1>
          <p className="text-gray-400">
            Configure OBS Studio to stream to your platform of choice
          </p>
        </div>

        {/* Owncast Setup Section */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Video className="h-8 w-8 text-green-500" />
            <h2 className="text-2xl font-bold text-white">Step 1: Deploy Owncast Server</h2>
          </div>
          <p className="text-gray-300 mb-6">
            Owncast is a free, open-source, self-hosted streaming platform. Deploy it to get complete control over your streaming infrastructure.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Option A: Docker (Recommended)</h3>
              <div className="bg-black rounded p-3 text-green-400 font-mono text-sm overflow-x-auto">
                <div># Deploy Owncast with Docker</div>
                <div>docker run -d \</div>
                <div>  --name owncast \</div>
                <div>  -p 8080:8080 \</div>
                <div>  -p 1935:1935 \</div>
                <div>  -v owncast-data:/app/data \</div>
                <div>  gabekangas/owncast:latest</div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Access your Owncast admin at: <code className="text-blue-400">http://localhost:8080/admin</code>
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Option B: VPS Deployment</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div>1. Get a VPS (DigitalOcean, Linode, etc.)</div>
                <div>2. Install Docker on your server</div>
                <div>3. Run the Docker command above</div>
                <div>4. Configure domain and SSL</div>
                <div>5. Set up firewall rules</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">Quick Start Guide:</h4>
            <ol className="text-sm text-gray-300 space-y-1">
              <li>1. Deploy Owncast using Docker command above</li>
              <li>2. Visit <code className="text-blue-400">http://localhost:8080/admin</code></li>
              <li>3. Set up your stream key and configure settings</li>
              <li>4. Use the RTMP URL and stream key in OBS</li>
              <li>5. Start streaming!</li>
            </ol>
          </div>
        </div>

        {/* OBS Download Section */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Download className="h-8 w-8 text-blue-500" />
            <h2 className="text-2xl font-bold text-white">Step 2: Download OBS Studio</h2>
          </div>
          <p className="text-gray-300 mb-6">
            OBS Studio is free, open-source software for video recording and live streaming.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://obsproject.com/download"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <ExternalLink className="h-5 w-5" />
              <span>Download OBS Studio</span>
            </a>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              <Video className="h-5 w-5 mr-2" />
              Watch Setup Tutorial
            </button>
          </div>
        </div>

        {/* Streaming Platform Options */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {streamingOptions.map((option, index) => (
            <div key={index} className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{option.name}</h3>
                <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                  FREE
                </span>
              </div>
              <p className="text-gray-300 mb-4">{option.description}</p>
              
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    RTMP URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option.rtmpUrl}
                      readOnly
                      className="flex-1 bg-gray-800 text-white rounded px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(option.rtmpUrl, `rtmp-${index}`)}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors"
                    >
                      {copiedItem === `rtmp-${index}` ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Stream Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="password"
                      value={option.streamKey}
                      readOnly
                      className="flex-1 bg-gray-800 text-white rounded px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(option.streamKey, `key-${index}`)}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors"
                    >
                      {copiedItem === `key-${index}` ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-green-400 mb-2">Pros:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {option.pros.map((pro, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-2">Cons:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {option.cons.map((con, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="text-red-400">✗</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <a
                href={option.setupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Get Stream Key</span>
              </a>
            </div>
          ))}
        </div>

        {/* OBS Configuration Steps */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="h-8 w-8 text-primary-500" />
            <h2 className="text-2xl font-bold text-white">Step 3: Configure OBS Studio</h2>
          </div>
          
          <div className="space-y-6">
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="text-lg font-semibold text-white mb-2">1. Open OBS Settings</h3>
              <p className="text-gray-300">Go to <strong>File → Settings</strong> in OBS Studio</p>
            </div>
            
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="text-lg font-semibold text-white mb-2">2. Configure Stream Settings</h3>
              <p className="text-gray-300 mb-2">In the Settings window:</p>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• Go to <strong>Stream</strong> tab</li>
                <li>• Select <strong>Custom</strong> as Service</li>
                <li>• Paste your RTMP URL in <strong>Server</strong></li>
                <li>• Paste your Stream Key in <strong>Stream Key</strong></li>
              </ul>
            </div>
            
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="text-lg font-semibold text-white mb-2">3. Configure Output Settings</h3>
              <p className="text-gray-300 mb-2">Go to <strong>Output</strong> tab:</p>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• Set Output Mode to <strong>Simple</strong></li>
                <li>• Video Bitrate: <strong>2500 Kbps</strong> (for 720p)</li>
                <li>• Average Bitrate: <strong>2500 Kbps</strong></li>
              </ul>
            </div>
            
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="text-lg font-semibold text-white mb-2">4. Configure Video Settings</h3>
              <p className="text-gray-300 mb-2">Go to <strong>Video</strong> tab:</p>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• Base Resolution: <strong>1920x1080</strong></li>
                <li>• Output Resolution: <strong>1280x720</strong></li>
                <li>• FPS: <strong>30</strong></li>
              </ul>
            </div>
            
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="text-lg font-semibold text-white mb-2">5. Add Sources</h3>
              <p className="text-gray-300 mb-2">In the Sources panel, add:</p>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• <strong>Display Capture</strong> - to share your screen</li>
                <li>• <strong>Video Capture Device</strong> - for webcam</li>
                <li>• <strong>Audio Input Capture</strong> - for microphone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Hardware Setup */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Monitor className="h-8 w-8 text-green-500" />
            <h2 className="text-2xl font-bold text-white">Step 4: Hardware Setup</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Screen Sharing</h3>
              <p className="text-gray-300 text-sm">
                Share your entire screen or specific windows for coding tutorials
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Webcam</h3>
              <p className="text-gray-300 text-sm">
                Add a face cam for personal connection with viewers
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Microphone</h3>
              <p className="text-gray-300 text-sm">
                Clear audio is essential for educational content
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <button
            onClick={() => router.back()}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => router.push('/dashboard/stream/new')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <Video className="h-5 w-5" />
            <span>Create Stream</span>
          </button>
        </div>
      </div>
    </main>
  )
}
