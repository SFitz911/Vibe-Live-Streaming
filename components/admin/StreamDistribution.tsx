'use client';

import { useState, useEffect } from 'react';
import { Video, Youtube, Radio, Archive, Tag, MapPin } from 'lucide-react';

interface StreamDistributionData {
  total: number;
  youtube: number;
  liveEvents: number;
  currentlyLive: number;
  categories: { [key: string]: number };
  pages: {
    homepage_live: number;
    homepage_recorded: number;
    discover: number;
    recordings: number;
  };
}

export default function StreamDistribution() {
  const [data, setData] = useState<StreamDistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDistribution = async () => {
    try {
      const response = await fetch('/api/admin/resources/distribution');
      if (!response.ok) {
        throw new Error('Failed to fetch stream distribution');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching distribution:', err);
      setError('Failed to load stream distribution');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistribution();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
        <p className="text-red-400">{error || 'No data available'}</p>
        <button
          onClick={fetchDistribution}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  const topCategories = Object.entries(data.categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <MapPin className="h-6 w-6 text-blue-400" />
          Stream Distribution
        </h2>
        <button
          onClick={fetchDistribution}
          className="text-sm text-gray-400 hover:text-white transition-colors"
          title="Refresh now"
        >
          🔄 Refresh
        </button>
      </div>

      <p className="text-gray-400 text-sm mb-6">
        Overview of where your {data.total} streams are located and organized
      </p>

      {/* Source Type Breakdown */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">
          📹 By Source Type
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/50 p-4 rounded-lg border border-blue-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Youtube className="h-5 w-5 text-blue-400" />
              <span className="text-xs text-gray-400">YouTube (Nextwork)</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">{data.youtube}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((data.youtube / data.total) * 100).toFixed(0)}% of total
            </p>
          </div>
          
          <div className="bg-gray-900/50 p-4 rounded-lg border border-purple-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Video className="h-5 w-5 text-purple-400" />
              <span className="text-xs text-gray-400">Live Events (Users)</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">{data.liveEvents}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((data.liveEvents / data.total) * 100).toFixed(0)}% of total
            </p>
          </div>
        </div>
      </div>

      {/* Page Distribution */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">
          📍 Where Streams Appear
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-400" />
              <span className="text-sm text-gray-300">Discover Page (Live Now)</span>
            </div>
            <span className="text-sm font-semibold text-red-400">
              {data.pages.discover} live
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">Homepage (Live Section)</span>
            </div>
            <span className="text-sm font-semibold text-green-400">
              {data.pages.homepage_live} live
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">Homepage (Recorded Sessions)</span>
            </div>
            <span className="text-sm font-semibold text-blue-400">
              {data.pages.homepage_recorded} recorded
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">Recordings Page</span>
            </div>
            <span className="text-sm font-semibold text-purple-400">
              {data.pages.recordings} total
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {topCategories.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            🏷️ Top Categories
          </h3>
          <div className="space-y-2">
            {topCategories.map(([category, count], index) => {
              const percentage = (count / data.total) * 100;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3 w-3 text-yellow-400" />
                      <span className="text-xs text-gray-300">{category}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-300">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-700/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-400 mb-1">Total Streams</p>
            <p className="text-2xl font-bold text-white">{data.total}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Currently Live</p>
            <p className="text-2xl font-bold text-red-400">{data.currentlyLive}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Categories</p>
            <p className="text-2xl font-bold text-yellow-400">
              {Object.keys(data.categories).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

