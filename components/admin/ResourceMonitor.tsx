'use client';

import { useState, useEffect, useRef } from 'react';

interface ResourceStats {
  timestamp: string;
  streams: {
    total: number;
    youtube: number;
    live_events: number;
    currently_live: number;
  };
  storage: {
    youtube_thumbnails_mb: number;
    live_30s_clips_mb: number;
    live_12s_clips_mb: number;
    live_frozen_thumbs_mb: number;
    live_full_recordings_gb: number;
    total_mb: number;
    total_gb: number;
  };
  bandwidth: {
    today_gb: number;
    month_gb: number;
    daily_average_gb: number;
  };
  cost: {
    current_mode: string;
    estimated_monthly: number;
    storage_cost: number;
    bandwidth_cost: number;
  };
}

interface ResourceMonitorProps {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  currentMode?: 'frozen' | 'hover' | '12s' | '30s';
}

export default function ResourceMonitor({ 
  autoRefresh = true, 
  refreshInterval = 5000,
  currentMode 
}: ResourceMonitorProps) {
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/resources/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch resource stats');
      }
      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching resource stats:', err);
      setError('Failed to load resource data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchStats, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // Refresh stats when currentMode changes
  useEffect(() => {
    if (currentMode) {
      console.log('Mode changed to:', currentMode, '- Refreshing stats...');
      fetchStats();
    }
  }, [currentMode]);

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressLabel = (percentage: number) => {
    if (percentage < 50) return '🟢 Good';
    if (percentage < 75) return '🟡 Moderate';
    return '🔴 High';
  };

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

  if (error || !stats) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-red-700">
        <p className="text-red-400">{error || 'No data available'}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  const STORAGE_LIMIT_GB = 100; // Supabase Pro: 100GB storage
  const BANDWIDTH_DAILY_TARGET_GB = 200; // Supabase Pro: 200GB bandwidth per day
  
  const storagePercentage = (stats.storage.total_gb / STORAGE_LIMIT_GB) * 100;
  const bandwidthPercentage = (stats.bandwidth.today_gb / BANDWIDTH_DAILY_TARGET_GB) * 100;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          📈 Real-Time Resource Monitor
        </h2>
        <button
          onClick={fetchStats}
          className="text-sm text-gray-400 hover:text-white transition-colors"
          title="Refresh now"
        >
          🔄 Refresh
        </button>
      </div>

      {lastUpdated && (
        <p className="text-xs text-gray-500 mb-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
          {autoRefresh && ' (auto-refreshing every 5s)'}
          {!autoRefresh && ' (click refresh to update)'}
        </p>
      )}

      {/* Current Mode */}
      <div className="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-700/50">
        <p className="text-sm text-gray-400 mb-1">Current Mode</p>
        <p className="text-2xl font-bold text-purple-300">
          {(currentMode || stats.cost.current_mode) === 'frozen' && '🖼️ Thumbnail Frozen'}
          {(currentMode || stats.cost.current_mode) === 'hover' && '🎬 Thumbnail Hover Only'}
          {(currentMode || stats.cost.current_mode) === '12s' && '⏱️ Thumbnail 12 Seconds'}
          {(currentMode || stats.cost.current_mode) === '30s' && '🎥 Thumbnail 30 Seconds'}
        </p>
      </div>

      {/* Stream Counts */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Streams Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 p-3 rounded">
            <p className="text-xs text-gray-400 mb-1">Total Streams</p>
            <p className="text-2xl font-bold text-white">{stats.streams.total}</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded">
            <p className="text-xs text-gray-400 mb-1">YouTube 🎓</p>
            <p className="text-2xl font-bold text-blue-400">{stats.streams.youtube}</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded">
            <p className="text-xs text-gray-400 mb-1">Live Events 🎥</p>
            <p className="text-2xl font-bold text-purple-400">{stats.streams.live_events}</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded">
            <p className="text-xs text-gray-400 mb-1">Currently Live 🔴</p>
            <p className="text-2xl font-bold text-red-400">{stats.streams.currently_live}</p>
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-300">Storage Usage</h3>
            <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full">
              PRO
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-300">
            {stats.storage.total_gb.toFixed(2)} GB / {STORAGE_LIMIT_GB} GB
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
          <div
            className={`h-full ${getProgressColor(storagePercentage)} transition-all duration-500 flex items-center justify-end pr-2`}
            style={{ width: `${Math.min(storagePercentage, 100)}%` }}
          >
            <span className="text-xs font-bold text-white">
              {storagePercentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {getProgressLabel(storagePercentage)}
        </p>
      </div>

      {/* Storage Breakdown */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Storage Breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">• YouTube Thumbnails:</span>
            <span className="text-white font-medium">
              {stats.storage.youtube_thumbnails_mb.toFixed(1)} MB 
              <span className="text-gray-500 text-xs ml-1">({stats.streams.youtube} images)</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">• 30s Previews:</span>
            <span className="text-white font-medium">
              {stats.storage.live_30s_clips_mb.toFixed(1)} MB
              <span className="text-gray-500 text-xs ml-1">({stats.streams.live_events} videos)</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">• 12s Previews:</span>
            <span className="text-white font-medium">
              {stats.storage.live_12s_clips_mb.toFixed(1)} MB
              <span className="text-gray-500 text-xs ml-1">({stats.streams.live_events} videos)</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">• Frozen Thumbs:</span>
            <span className="text-white font-medium">
              {stats.storage.live_frozen_thumbs_mb.toFixed(1)} MB
              <span className="text-gray-500 text-xs ml-1">({stats.streams.live_events} images)</span>
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-700 pt-2">
            <span className="text-gray-400">• Full Recordings:</span>
            <span className="text-white font-medium">
              {stats.storage.live_full_recordings_gb.toFixed(2)} GB
              <span className="text-gray-500 text-xs ml-1">({stats.streams.live_events} videos)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bandwidth Usage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-300">Bandwidth (Today)</h3>
          <span className="text-sm font-semibold text-gray-300">
            {stats.bandwidth.today_gb.toFixed(2)} GB
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
          <div
            className={`h-full ${getProgressColor(bandwidthPercentage)} transition-all duration-500 flex items-center justify-end pr-2`}
            style={{ width: `${Math.min(bandwidthPercentage, 100)}%` }}
          >
            <span className="text-xs font-bold text-white">
              {bandwidthPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {getProgressLabel(bandwidthPercentage)} • Monthly: {stats.bandwidth.month_gb.toFixed(1)} GB
        </p>
      </div>

      {/* Cost Estimate */}
      <div className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-700/50">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Estimated Monthly Cost</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-purple-300">
            ${stats.cost.estimated_monthly.toFixed(2)}
          </span>
          <span className="text-sm text-gray-400">/month</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Storage: ${stats.cost.storage_cost.toFixed(2)} • Bandwidth: ${stats.cost.bandwidth_cost.toFixed(2)}
        </div>
        
        {stats.cost.estimated_monthly > 1 && stats.cost.current_mode !== 'hover' && (
          <div className="mt-3 p-2 bg-yellow-900/30 rounded border border-yellow-700/50">
            <p className="text-xs text-yellow-300">
              💡 Tip: Switch to "Hover Only" mode to reduce costs to $0.00 while maintaining interactivity
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

