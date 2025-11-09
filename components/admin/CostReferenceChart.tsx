'use client';

import { DollarSign, Database, Zap, TrendingUp, Info, Video } from 'lucide-react';

export default function CostReferenceChart() {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <DollarSign className="h-6 w-6 text-green-400" />
        <h2 className="text-xl font-semibold text-white">
          💰 Supabase Pro Cost Reference
        </h2>
      </div>
      
      <p className="text-gray-400 text-sm mb-6">
        Understanding your Supabase Pro plan costs and usage limits
      </p>

      {/* Pro Plan Overview */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-purple-300">
            Your Current Plan: Supabase Pro
          </h3>
          <span className="px-3 py-1 text-sm font-bold bg-purple-600 text-white rounded-full">
            $25/month
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-1">Storage Included</p>
            <p className="text-2xl font-bold text-white">100 GB</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Bandwidth Included</p>
            <p className="text-2xl font-bold text-white">250 GB/mo</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Database Size</p>
            <p className="text-2xl font-bold text-white">8 GB</p>
          </div>
        </div>
      </div>

      {/* Video Recording Capacity Calculator */}
      <div className="mb-6 p-5 bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-lg border-2 border-blue-500/50">
        <div className="flex items-center gap-2 mb-4">
          <Video className="h-6 w-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">🎥 Video Recording Capacity</h3>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-blue-500/30 text-center">
            <p className="text-xs text-gray-400 mb-1">Your Actual Video Size</p>
            <p className="text-3xl font-bold text-blue-300">~800 MB</p>
            <p className="text-sm text-gray-400 mt-1">per hour (0.8 GB/hr)</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-green-500/30 text-center">
            <p className="text-xs text-gray-400 mb-1">Your 100 GB Holds</p>
            <p className="text-3xl font-bold text-green-300">~125</p>
            <p className="text-sm text-gray-400 mt-1">hours of video</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/30 text-center">
            <p className="text-xs text-gray-400 mb-1">Cost Per Hour</p>
            <p className="text-3xl font-bold text-purple-300">$0.017</p>
            <p className="text-sm text-gray-400 mt-1">if over 100 GB</p>
          </div>
        </div>

        {/* Detailed Capacity Table */}
        <div className="bg-gray-800/70 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">📊 Storage Capacity Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 text-gray-300">Storage Size</th>
                  <th className="text-right py-2 text-gray-300">Hours of Video</th>
                  <th className="text-right py-2 text-gray-300"># of Streams (1hr avg)</th>
                  <th className="text-right py-2 text-gray-300">Cost (if extra)</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700/50">
                  <td className="py-2">1 GB</td>
                  <td className="text-right py-2">~1.25 hours</td>
                  <td className="text-right py-2">1 stream</td>
                  <td className="text-right py-2 text-yellow-400">$0.021</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-2">10 GB</td>
                  <td className="text-right py-2">~12.5 hours</td>
                  <td className="text-right py-2">12 streams</td>
                  <td className="text-right py-2 text-yellow-400">$0.21</td>
                </tr>
                <tr className="border-b border-gray-700/50 bg-green-900/20">
                  <td className="py-2 font-bold">100 GB (Included)</td>
                  <td className="text-right py-2 font-bold">~125 hours</td>
                  <td className="text-right py-2 font-bold">125 streams</td>
                  <td className="text-right py-2 text-green-400 font-bold">$0.00</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-2">200 GB (100 GB extra)</td>
                  <td className="text-right py-2">~250 hours</td>
                  <td className="text-right py-2">250 streams</td>
                  <td className="text-right py-2 text-orange-400">$2.10</td>
                </tr>
                <tr>
                  <td className="py-2">1 TB (900 GB extra)</td>
                  <td className="text-right py-2">~1,250 hours</td>
                  <td className="text-right py-2">1,250 streams</td>
                  <td className="text-right py-2 text-red-400">$18.90</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Practical Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 p-3 rounded border border-green-500/30">
            <p className="text-xs text-green-300 font-semibold mb-2">✅ Your Actual Usage (Measured)</p>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-white">8.52 MB for 38 seconds</span> = <span className="font-bold text-green-300">~800 MB/hour</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Real test: 13.44 MB/min | At 200 MB/day usage, safe for ~500 days!
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-3 rounded border border-blue-500/30">
            <p className="text-xs text-blue-300 font-semibold mb-2">💡 Storage Capacity</p>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-white">1 GB = ~1.25 hours</span> (75 minutes)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              100 GB = ~125 hours or 125 one-hour streams
            </p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Storage Costs */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-5 w-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">Storage Costs</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
              <span className="text-gray-300">First 100 GB</span>
              <span className="font-bold text-green-400">$0.00</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
              <span className="text-gray-300">Per 2 GB (extra)</span>
              <span className="font-bold text-yellow-400">$0.042</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
              <span className="text-gray-300">Per 100 GB (extra)</span>
              <span className="font-bold text-orange-400">$2.10</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded border border-blue-500/30">
              <span className="text-gray-300">Per 1 TB (extra)</span>
              <span className="font-bold text-red-400">$21.00</span>
            </div>
          </div>

          <div className="mt-3 p-2 bg-blue-900/20 rounded border border-blue-700/30 text-xs text-blue-300">
            <Info className="h-3 w-3 inline mr-1" />
            Storage cost = $0.021 per GB per month over 100 GB
          </div>
        </div>

        {/* Bandwidth Costs */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-yellow-400" />
            <h3 className="text-base font-semibold text-white">Bandwidth Costs</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
              <span className="text-gray-300">First 250 GB/mo</span>
              <span className="font-bold text-green-400">$0.00</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
              <span className="text-gray-300">Per 2 GB (extra)</span>
              <span className="font-bold text-yellow-400">$0.18</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
              <span className="text-gray-300">Per 100 GB (extra)</span>
              <span className="font-bold text-orange-400">$9.00</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded border border-yellow-500/30">
              <span className="text-gray-300">Per 1 TB (extra)</span>
              <span className="font-bold text-red-400">$90.00</span>
            </div>
          </div>

          <div className="mt-3 p-2 bg-yellow-900/20 rounded border border-yellow-700/30 text-xs text-yellow-300">
            <Info className="h-3 w-3 inline mr-1" />
            Bandwidth cost = $0.09 per GB over 250 GB/mo
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-green-400" />
          <h3 className="text-base font-semibold text-white">Usage Cost Examples</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-300">Usage Scenario</th>
                <th className="text-right py-2 px-3 text-gray-300">Storage</th>
                <th className="text-right py-2 px-3 text-gray-300">Bandwidth/mo</th>
                <th className="text-right py-2 px-3 text-gray-300">Extra Cost</th>
                <th className="text-right py-2 px-3 text-gray-300">Total/mo</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-700/50 bg-green-900/10">
                <td className="py-2 px-3">Within limits</td>
                <td className="text-right py-2 px-3">80 GB</td>
                <td className="text-right py-2 px-3">200 GB</td>
                <td className="text-right py-2 px-3 text-green-400 font-bold">$0.00</td>
                <td className="text-right py-2 px-3 font-bold text-green-400">$25.00</td>
              </tr>
              <tr className="border-b border-gray-700/50 bg-yellow-900/10">
                <td className="py-2 px-3">Light overage</td>
                <td className="text-right py-2 px-3">110 GB</td>
                <td className="text-right py-2 px-3">300 GB</td>
                <td className="text-right py-2 px-3 text-yellow-400 font-bold">$4.71</td>
                <td className="text-right py-2 px-3 font-bold text-yellow-400">$29.71</td>
              </tr>
              <tr className="border-b border-gray-700/50 bg-orange-900/10">
                <td className="py-2 px-3">Medium overage</td>
                <td className="text-right py-2 px-3">150 GB</td>
                <td className="text-right py-2 px-3">500 GB</td>
                <td className="text-right py-2 px-3 text-orange-400 font-bold">$23.55</td>
                <td className="text-right py-2 px-3 font-bold text-orange-400">$48.55</td>
              </tr>
              <tr className="bg-red-900/10">
                <td className="py-2 px-3">Heavy usage</td>
                <td className="text-right py-2 px-3">200 GB</td>
                <td className="text-right py-2 px-3">1 TB</td>
                <td className="text-right py-2 px-3 text-red-400 font-bold">$69.60</td>
                <td className="text-right py-2 px-3 font-bold text-red-400">$94.60</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Reference Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 p-3 rounded border border-gray-700 text-center">
          <p className="text-xs text-gray-400 mb-1">Break-even Point</p>
          <p className="text-sm font-bold text-white">100 GB Storage</p>
          <p className="text-xs text-gray-500">250 GB Bandwidth</p>
        </div>
        <div className="bg-gray-800/50 p-3 rounded border border-gray-700 text-center">
          <p className="text-xs text-gray-400 mb-1">10 GB Storage Cost</p>
          <p className="text-sm font-bold text-green-400">$0.21</p>
          <p className="text-xs text-gray-500">over included limit</p>
        </div>
        <div className="bg-gray-800/50 p-3 rounded border border-gray-700 text-center">
          <p className="text-xs text-gray-400 mb-1">100 GB Bandwidth</p>
          <p className="text-sm font-bold text-yellow-400">$9.00</p>
          <p className="text-xs text-gray-500">over 250 GB limit</p>
        </div>
        <div className="bg-gray-800/50 p-3 rounded border border-gray-700 text-center">
          <p className="text-xs text-gray-400 mb-1">Daily Bandwidth</p>
          <p className="text-sm font-bold text-blue-400">~8.3 GB</p>
          <p className="text-xs text-gray-500">to stay in limits</p>
        </div>
      </div>

      {/* Cost Optimization Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-700/30">
        <h4 className="text-sm font-semibold text-green-300 mb-2">💡 Cost Optimization Tips</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Use "Hover Only" or "Frozen" thumbnail modes to minimize bandwidth usage</li>
          <li>• Enable auto-cleanup for old recordings to stay within 100GB storage</li>
          <li>• YouTube streams use minimal storage (100KB each) - prioritize these for catalog</li>
          <li>• Your recordings use ~800MB per hour (0.8 GB/hr) with WebM VP9 - typical for good quality</li>
          <li>• Monitor daily bandwidth to avoid exceeding 8.3 GB/day average</li>
        </ul>
      </div>

      {/* Static Reference Chart - Video Size Calculation */}
      <div className="mt-8 p-5 bg-gradient-to-br from-yellow-900/40 via-orange-900/40 to-red-900/40 rounded-xl border-2 border-yellow-500/50 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-yellow-500 text-black p-2 rounded-lg font-bold text-xs">
            REFERENCE
          </div>
          <h3 className="text-lg font-semibold text-yellow-300">
            📏 Video Size Calculation (Measured Data)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Actual Test Data */}
          <div className="bg-gray-900/70 p-4 rounded-lg border border-yellow-500/30">
            <p className="text-xs text-yellow-300 font-semibold mb-3">🎬 Actual Recording Test</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">File Size:</span>
                <span className="font-bold text-white">8.52 MB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Duration:</span>
                <span className="font-bold text-white">38 seconds</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                <span className="text-gray-300">Format:</span>
                <span className="font-bold text-blue-300">WebM VP9 + Opus</span>
              </div>
            </div>
          </div>

          {/* Calculation */}
          <div className="bg-gray-900/70 p-4 rounded-lg border border-orange-500/30">
            <p className="text-xs text-orange-300 font-semibold mb-3">🧮 Math Breakdown</p>
            <div className="space-y-2 text-sm font-mono">
              <div className="text-gray-300">
                8.52 MB ÷ 38 sec = <span className="text-white font-bold">0.224 MB/sec</span>
              </div>
              <div className="text-gray-300">
                0.224 × 60 = <span className="text-white font-bold">13.44 MB/min</span>
              </div>
              <div className="text-gray-300">
                13.44 × 60 = <span className="text-yellow-300 font-bold text-base">~806 MB/hour</span>
              </div>
              <div className="pt-2 border-t border-gray-700 text-gray-400 text-xs">
                ≈ <span className="text-green-300 font-bold">0.8 GB per hour</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reference Table */}
        <div className="bg-gray-900/70 rounded-lg p-4 border border-red-500/30">
          <p className="text-xs text-red-300 font-semibold mb-3">⚡ Quick Reference</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
            <div className="bg-gray-800/50 p-2 rounded">
              <p className="text-xs text-gray-400 mb-1">1 Minute</p>
              <p className="font-bold text-white">~13 MB</p>
            </div>
            <div className="bg-gray-800/50 p-2 rounded">
              <p className="text-xs text-gray-400 mb-1">1 Hour</p>
              <p className="font-bold text-yellow-300">~800 MB</p>
            </div>
            <div className="bg-gray-800/50 p-2 rounded">
              <p className="text-xs text-gray-400 mb-1">10 Hours</p>
              <p className="font-bold text-orange-300">~8 GB</p>
            </div>
            <div className="bg-gray-800/50 p-2 rounded">
              <p className="text-xs text-gray-400 mb-1">100 Hours</p>
              <p className="font-bold text-red-300">~80 GB</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-900/20 rounded border border-yellow-700/30">
          <p className="text-xs text-yellow-200">
            <strong>💡 Note:</strong> This calculation is based on your actual WebM VP9 screen recording. 
            Quality settings, resolution, and content complexity may affect file sizes. Use this as your baseline reference.
          </p>
        </div>
      </div>
    </div>
  );
}

