'use client';

interface CostComparisonTableProps {
  youtubeStreams: number;
  liveEventStreams: number;
  currentMode: 'frozen' | 'hover' | '12s' | '30s';
}

export default function CostComparisonTable({ 
  youtubeStreams, 
  liveEventStreams,
  currentMode 
}: CostComparisonTableProps) {
  
  const modes = [
    {
      id: 'frozen' as const,
      name: 'Frozen',
      youtubeCalc: `${youtubeStreams} × 100KB`,
      youtubeSize: youtubeStreams * 0.1,
      liveCalc: `${liveEventStreams} × 100KB`,
      liveSize: liveEventStreams * 0.1,
      totalStorage: (youtubeStreams * 0.1) + (liveEventStreams * 0.1),
      bandwidth: 0.1,
      cost: 0.00
    },
    {
      id: 'hover' as const,
      name: 'Hover Only',
      youtubeCalc: `${youtubeStreams} × 100KB`,
      youtubeSize: youtubeStreams * 0.1,
      liveCalc: `${liveEventStreams} × (100KB + 1MB)`,
      liveSize: liveEventStreams * 1.1,
      totalStorage: (youtubeStreams * 0.1) + (liveEventStreams * 1.1),
      bandwidth: 1,
      cost: 0.00
    },
    {
      id: '12s' as const,
      name: '12s Preview',
      youtubeCalc: `${youtubeStreams} × 100KB`,
      youtubeSize: youtubeStreams * 0.1,
      liveCalc: `${liveEventStreams} × 1.5MB`,
      liveSize: liveEventStreams * 1.5,
      totalStorage: (youtubeStreams * 0.1) + (liveEventStreams * 1.5),
      bandwidth: 8,
      cost: 0.54
    },
    {
      id: '30s' as const,
      name: '30s Preview',
      youtubeCalc: `${youtubeStreams} × 100KB`,
      youtubeSize: youtubeStreams * 0.1,
      liveCalc: `${liveEventStreams} × 3.5MB`,
      liveSize: liveEventStreams * 3.5,
      totalStorage: (youtubeStreams * 0.1) + (liveEventStreams * 3.5),
      bandwidth: 18,
      cost: 1.44
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-2">
        📊 Mode Comparison
      </h2>
      <p className="text-gray-400 text-sm mb-4">
        Based on {youtubeStreams + liveEventStreams} streams ({youtubeStreams} YouTube, {liveEventStreams} Live Events)
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Mode</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">YouTube Streams</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Live Events</th>
              <th className="text-right py-3 px-4 text-gray-300 font-semibold">Storage</th>
              <th className="text-right py-3 px-4 text-gray-300 font-semibold">Bandwidth/Day</th>
              <th className="text-right py-3 px-4 text-gray-300 font-semibold">Monthly Cost</th>
            </tr>
          </thead>
          <tbody>
            {modes.map((mode) => {
              const isActive = currentMode === mode.id;
              
              return (
                <tr 
                  key={mode.id}
                  className={`
                    border-b border-gray-700/50
                    ${isActive ? 'bg-purple-900/30' : 'hover:bg-gray-700/30'}
                  `}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isActive ? 'text-purple-300' : 'text-gray-200'}`}>
                        {mode.name}
                      </span>
                      {isActive && (
                        <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    <div className="text-xs text-gray-400">{mode.youtubeCalc}</div>
                    <div className="font-medium">{mode.youtubeSize.toFixed(1)} MB</div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    <div className="text-xs text-gray-400">{mode.liveCalc}</div>
                    <div className="font-medium">{mode.liveSize.toFixed(1)} MB</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${isActive ? 'text-purple-300' : 'text-gray-200'}`}>
                      {mode.totalStorage.toFixed(0)} MB
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300">
                    ~{mode.bandwidth} GB
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-lg font-bold ${
                      mode.cost === 0 
                        ? 'text-green-400' 
                        : mode.cost < 1 
                        ? 'text-yellow-400' 
                        : 'text-orange-400'
                    }`}>
                      ${mode.cost.toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-gray-900/50 rounded border border-gray-700">
        <p className="text-xs text-gray-400">
          💡 <strong>Note:</strong> YouTube streams always use minimal storage (static thumbnails only). 
          Cost scaling occurs primarily with live event content.
        </p>
      </div>
    </div>
  );
}

