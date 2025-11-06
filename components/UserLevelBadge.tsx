'use client'

import { Trophy, Star } from 'lucide-react'

interface UserLevelBadgeProps {
  totalPoints: number
  size?: 'small' | 'medium' | 'large'
  showProgress?: boolean
}

export default function UserLevelBadge({ 
  totalPoints, 
  size = 'medium',
  showProgress = false 
}: UserLevelBadgeProps) {
  // Calculate level (1-9)
  const level = Math.min(Math.floor(totalPoints / 100) + 1, 9)
  const levelProgress = ((totalPoints % 100) / 100) * 100
  const pointsToNextLevel = (level * 100) - totalPoints

  const levelTitles = [
    '', 'Beginner', 'Novice', 'Apprentice', 'Intermediate',
    'Advanced', 'Expert', 'Master', 'Guru', 'Legend'
  ]

  const levelColors = [
    '',
    'from-gray-600 to-gray-700',      // Level 1
    'from-blue-600 to-blue-700',      // Level 2
    'from-green-600 to-green-700',    // Level 3
    'from-yellow-600 to-yellow-700',  // Level 4
    'from-orange-600 to-orange-700',  // Level 5
    'from-red-600 to-red-700',        // Level 6
    'from-purple-600 to-purple-700',  // Level 7
    'from-pink-600 to-pink-700',      // Level 8
    'from-gradient-to-r from-yellow-400 via-red-500 to-purple-600', // Level 9 - LEGENDARY
  ]

  if (size === 'small') {
    return (
      <div className="inline-flex flex-col items-center justify-center bg-gray-800/70 border border-gray-700 px-2 py-1 rounded-md min-w-[48px]">
        <div className="flex items-center leading-none">
          <Star className="fill-current text-yellow-400" size={9} />
          <span className="text-gray-400 text-[8px] font-medium uppercase tracking-wide ml-0.5">Lvl</span>
        </div>
        <span className="text-white text-lg font-light leading-tight mt-0.5">{level}</span>
      </div>
    )
  }

  if (size === 'large') {
    return (
      <div className={`bg-gradient-to-br ${levelColors[level]} rounded-2xl p-6 text-center`}>
        <div className="flex items-center justify-center mb-2">
          <Trophy className="text-yellow-300 mr-2" size={28} />
          <span className="text-white text-sm font-medium">LEVEL</span>
        </div>
        <div className="text-6xl font-bold text-white mb-2">{level}</div>
        <p className="text-yellow-300 text-sm font-semibold mb-1">{levelTitles[level]}</p>
        <p className="text-white/80 text-xs mb-3">{totalPoints} XP</p>
        
        {showProgress && level < 9 && (
          <>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div 
                className="bg-yellow-300 h-2 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <p className="text-xs text-white/70">
              {pointsToNextLevel} XP to Level {level + 1}
            </p>
          </>
        )}
        
        {level === 9 && (
          <div className="mt-2">
            <span className="bg-yellow-300 text-gray-900 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              🌟 MAX LEVEL 🌟
            </span>
          </div>
        )}
      </div>
    )
  }

  // Medium (default)
  return (
    <div className={`bg-gradient-to-r ${levelColors[level]} rounded-lg px-4 py-2 inline-flex items-center`}>
      <Star className="fill-current text-yellow-300 mr-2" size={18} />
      <div className="text-left">
        <p className="text-white text-sm font-bold leading-none">Level {level}</p>
        <p className="text-white/80 text-xs">{levelTitles[level]}</p>
      </div>
    </div>
  )
}

// Helper to calculate user stats from streams, projects, and likes
export function calculateUserLevel(
  streams: any[], 
  projectsCompleted: number = 0,
  totalLikesReceived: number = 0
): { 
  level: number; 
  totalPoints: number;
  breakdown: {
    streamPoints: number;
    viewPoints: number;
    projectPoints: number;
    likePoints: number;
  }
} {
  const totalViews = streams.reduce((sum, s) => sum + (s.viewer_count || 0), 0)
  const totalStreams = streams.length
  
  const streamPoints = totalStreams * 10       // 10 points per stream
  const viewPoints = totalViews                // 1 point per view
  const projectPoints = projectsCompleted * 20 // 20 points per project
  const likePoints = totalLikesReceived        // 1 point per like
  
  const totalPoints = streamPoints + viewPoints + projectPoints + likePoints
  const level = Math.min(Math.floor(totalPoints / 100) + 1, 9)
  
  return { 
    level, 
    totalPoints,
    breakdown: {
      streamPoints,
      viewPoints,
      projectPoints,
      likePoints
    }
  }
}

