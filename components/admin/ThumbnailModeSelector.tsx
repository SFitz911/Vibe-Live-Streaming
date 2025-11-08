'use client';

import { useState } from 'react';

interface ThumbnailModeSelectorProps {
  currentMode: 'frozen' | 'hover' | '12s' | '30s';
  onModeChange: (mode: 'frozen' | 'hover' | '12s' | '30s') => Promise<void>;
}

export default function ThumbnailModeSelector({ currentMode, onModeChange }: ThumbnailModeSelectorProps) {
  const [updating, setUpdating] = useState(false);
  const [selectedMode, setSelectedMode] = useState(currentMode);

  const modes = [
    {
      id: 'frozen' as const,
      icon: '🖼️',
      label: 'Thumbnail Frozen',
      description: 'Static images only - minimal bandwidth'
    },
    {
      id: 'hover' as const,
      icon: '🎬',
      label: 'Thumbnail Hover Only',
      description: 'Video preview plays on mouseover'
    },
    {
      id: '12s' as const,
      icon: '⏱️',
      label: 'Thumbnail 12 Seconds',
      description: 'Auto-playing 12-second clips'
    },
    {
      id: '30s' as const,
      icon: '🎥',
      label: 'Thumbnail 30 Seconds',
      description: 'Auto-playing 30-second previews'
    }
  ];

  const handleModeClick = async (mode: 'frozen' | 'hover' | '12s' | '30s') => {
    if (mode === selectedMode || updating) return;

    setUpdating(true);
    try {
      await onModeChange(mode);
      setSelectedMode(mode);
    } catch (error) {
      console.error('Failed to update mode:', error);
      // Revert on error
      setSelectedMode(currentMode);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-2">
        Select Thumbnail Display Mode
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        Choose how stream thumbnails appear across the platform
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map((mode) => {
          const isActive = selectedMode === mode.id;
          const isUpdating = updating && selectedMode !== mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => handleModeClick(mode.id)}
              disabled={updating}
              className={`
                relative p-4 rounded-lg text-left transition-all duration-200
                ${isActive 
                  ? 'bg-purple-600 border-2 border-purple-400 shadow-lg shadow-purple-500/50' 
                  : 'bg-gray-700 border-2 border-gray-600 hover:border-gray-500 hover:bg-gray-650'
                }
                ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${updating ? '' : 'hover:scale-105'}
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  ACTIVE
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="text-3xl">{mode.icon}</div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${isActive ? 'text-white' : 'text-gray-200'}`}>
                    {mode.label}
                  </h3>
                  <p className={`text-sm ${isActive ? 'text-purple-100' : 'text-gray-400'}`}>
                    {mode.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {updating && (
        <div className="mt-4 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          Updating thumbnail mode...
        </div>
      )}
    </div>
  );
}

