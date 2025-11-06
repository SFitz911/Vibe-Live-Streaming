'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import BackButton from '@/components/BackButton'
import { useAuth } from '@/lib/auth'
import { Youtube, Link as LinkIcon, CheckCircle, Settings, Shield } from 'lucide-react'
import Link from 'next/link'

export default function ImportYouTubePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Web Development')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    if (!user) {
      setError('You must be logged in to import videos')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/streams/import-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl,
          title,
          description,
          category,
          userId: user.id,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setYoutubeUrl('')
        setTitle('')
        setDescription('')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to import video')
      }
    } catch (err) {
      setError('An error occurred while importing the video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackButton href="/dashboard" label="Back to Dashboard" />
        </div>
        
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Youtube className="text-red-500 mr-3" size={36} />
              Import YouTube Video
            </h1>
            <p className="text-gray-400">
              Add your existing YouTube tutorials to your Vibe Coding Live library
            </p>
          </div>
          
          <Link
            href="/dashboard/admin"
            className="bg-yellow-500/20 hover:bg-yellow-500/30 border-2 border-yellow-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 text-sm"
          >
            <Shield className="h-4 w-4" />
            <span>Admin</span>
          </Link>
        </div>

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-lg flex items-center">
            <CheckCircle className="mr-3" size={24} />
            <div>
              <p className="font-semibold">Video imported successfully!</p>
              <p className="text-sm">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* YouTube URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                YouTube URL <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/live/...
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Building a React App with TypeScript"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what the video covers..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Web Development">Web Development</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="DevOps">DevOps</option>
                <option value="Database">Database</option>
                <option value="Cyber Security">Cyber Security</option>
                <option value="AWS Cloud">AWS Cloud</option>
                <option value="Game Development">Game Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">How it works:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✓ We extract the video ID from your YouTube URL</li>
                <li>✓ The video will play directly from YouTube (embedded)</li>
                <li>✓ Thumbnail is automatically fetched from YouTube</li>
                <li>✓ Video appears in your dashboard and on the homepage</li>
                <li>✓ No storage used - video stays on YouTube</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Youtube className="mr-2" size={20} />
                {loading ? 'Importing...' : 'Import Video'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 border-2 border-gray-500 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Examples */}
        <div className="mt-8 bg-gray-900/50 rounded-lg p-6 border border-gray-800">
          <h3 className="text-white font-semibold mb-3">Example YouTube URLs:</h3>
          <ul className="text-sm text-gray-400 space-y-2 font-mono">
            <li>https://www.youtube.com/watch?v=dQw4w9WgXcQ</li>
            <li>https://youtu.be/dQw4w9WgXcQ</li>
            <li>https://www.youtube.com/live/dQw4w9WgXcQ</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

