'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThumbnailModeSelector from '@/components/admin/ThumbnailModeSelector';
import CostComparisonTable from '@/components/admin/CostComparisonTable';
import ResourceMonitor from '@/components/admin/ResourceMonitor';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<'frozen' | 'hover' | '12s' | '30s'>('hover');
  const [streamCounts, setStreamCounts] = useState({ youtube: 70, liveEvents: 30 });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Fetch current settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          setCurrentMode(data.thumbnail_mode || 'hover');
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    const fetchStreamCounts = async () => {
      try {
        const response = await fetch('/api/admin/resources/stats');
        if (response.ok) {
          const data = await response.json();
          setStreamCounts({
            youtube: data.streams.youtube,
            liveEvents: data.streams.live_events
          });
        }
      } catch (error) {
        console.error('Failed to fetch stream counts:', error);
      }
    };

    Promise.all([fetchSettings(), fetchStreamCounts()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleModeChange = async (mode: 'frozen' | 'hover' | '12s' | '30s') => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thumbnail_mode: mode,
          user_id: null // TODO: Get actual user ID from auth
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setCurrentMode(mode);
      setNotification({
        type: 'success',
        message: `Thumbnail mode updated to "${mode}" successfully!`
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error updating mode:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update thumbnail mode. Please try again.'
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">
            ⚙️ App Settings
          </h1>
          <p className="text-gray-400">
            Manage platform-wide settings and monitor resource usage
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg border ${
            notification.type === 'success' 
              ? 'bg-green-900/30 border-green-700 text-green-300' 
              : 'bg-red-900/30 border-red-700 text-red-300'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {/* Thumbnail Mode Selector */}
          <ThumbnailModeSelector
            currentMode={currentMode}
            onModeChange={handleModeChange}
          />

          {/* Cost Comparison Table */}
          <CostComparisonTable
            youtubeStreams={streamCounts.youtube}
            liveEventStreams={streamCounts.liveEvents}
            currentMode={currentMode}
          />

          {/* Resource Monitor */}
          <ResourceMonitor
            autoRefresh={true}
            refreshInterval={5000}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">
            ℹ️ About This Feature
          </h3>
          <div className="text-sm text-gray-400 space-y-2">
            <p>
              <strong className="text-gray-300">Admin Platform Cost Analysis</strong> gives you complete control over 
              how stream thumbnails are displayed across the platform, allowing you to balance user experience with 
              operational costs.
            </p>
            <p>
              Changes take effect immediately for all users. The resource monitor updates every 5 seconds to show 
              real-time usage data and cost projections.
            </p>
            <p>
              YouTube streams always use minimal storage (static thumbnails only). Cost scaling occurs primarily 
              with live event content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

