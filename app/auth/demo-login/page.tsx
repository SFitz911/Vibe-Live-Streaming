'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import BackButton from '@/components/BackButton'
import { Mail, Zap, Users, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function DemoLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Call demo login API
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to access demo')
        setLoading(false)
        return
      }

      // Auto sign in with the returned credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        setError('Access granted but sign in failed. Please try regular login.')
        setLoading(false)
        return
      }

      // Success! Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="max-w-md w-full">
          <div className="mb-6">
            <BackButton href="/auth/login" label="Back to Login" />
          </div>

          {/* Demo Badge */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-t-xl text-center font-bold">
            🚀 DEMO MODE - Instant Access
          </div>

          <div className="bg-gray-900 rounded-b-2xl p-8 shadow-xl border-l-4 border-r-4 border-b-4 border-green-500">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Quick Demo Access</h1>
              <p className="text-gray-400">
                Just enter your email - instant access, no password required!
              </p>
            </div>

            {/* Demo Features */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center text-sm text-gray-300">
                <Zap className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                <span>Instant access - no waiting</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Users className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                <span>Auto-creates account if new</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Eye className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                <span>Perfect for demos and events</span>
              </div>
            </div>

            <form onSubmit={handleDemoLogin} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Any email works - we'll create your account automatically
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Getting you in...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Instant Access</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Prefer regular login? <span className="text-blue-400 underline">Sign in here</span>
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                ⚡ Demo accounts use a default password and are perfect for events, presentations, and quick testing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

