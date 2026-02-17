'use client'

import { useEffect, useState } from 'react'
import { activity as activityApi } from '@/lib/api'
import { Filter } from 'lucide-react'

export default function ActivityLog() {
  const [entries, setEntries] = useState<any[]>([])
  const [signalMetrics, setSignalMetrics] = useState<any>(null)
  const [filters, setFilters] = useState({
    level: '2',
    creatorId: '',
    eventType: ''
  })

  useEffect(() => {
    loadActivity()
  }, [filters])

  const loadActivity = async () => {
    try {
      const params: Record<string, string> = {}
      if (filters.level) params.level = filters.level
      if (filters.creatorId) params.creatorId = filters.creatorId
      if (filters.eventType) params.eventType = filters.eventType
      
      const data = await activityApi.list(params)
      setEntries(data.activity)
      setSignalMetrics(data.signalMetrics)
    } catch (err) {
      console.error(err)
    }
  }

  const levelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-500'
      case 2: return 'bg-yellow-500'
      case 3: return 'bg-blue-500'
      default: return 'bg-zinc-500'
    }
  }

  const levelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Critical'
      case 2: return 'High'
      case 3: return 'Normal'
      default: return 'Background'
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Activity Log</h1>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-zinc-400" />
          <select
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
          >
            <option value="">All Levels</option>
            <option value="1">L1 Critical</option>
            <option value="2">L1-2 High+</option>
            <option value="3">L1-3 Normal+</option>
            <option value="4">All (incl. Background)</option>
          </select>
        </div>

        {/* Signal Metrics */}
        {signalMetrics && (
          <div className="flex items-center gap-4 ml-auto text-sm">
            <span className="text-zinc-400">
              Signal/Noise: <span className="text-white">{signalMetrics.ratio}</span>
            </span>
            <span className="text-zinc-400">
              L1: <span className="text-red-400">{signalMetrics.level1}</span>
            </span>
            <span className={`px-2 py-0.5 rounded ${
              signalMetrics.rating === 'GOOD' ? 'bg-green-500/20 text-green-400' :
              signalMetrics.rating === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {signalMetrics.rating}
            </span>
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No activity matching filters</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {entries.map(entry => (
              <div key={entry.id} className="p-4 hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Timestamp */}
                  <div className="text-zinc-500 text-sm w-20 flex-shrink-0">
                    {new Date(entry.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>

                  {/* Level indicator */}
                  <div className="flex items-center gap-2 w-20 flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${levelColor(entry.event_level)}`} />
                    <span className="text-xs text-zinc-400">L{entry.event_level}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white">{entry.title}</div>
                    {entry.description && (
                      <div className="text-zinc-400 text-sm mt-1">{entry.description}</div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                      {entry.creator_name && <span>{entry.creator_name}</span>}
                      {entry.agent_name && <span>{entry.agent_name}</span>}
                      <span className="px-1.5 py-0.5 bg-zinc-800 rounded">{entry.event_type}</span>
                    </div>
                  </div>

                  {/* Impact */}
                  {(entry.margin_impact || entry.risk_assessment) && (
                    <div className="text-right text-sm">
                      {entry.margin_impact && (
                        <div className={entry.margin_impact > 0 ? 'text-green-400' : 'text-red-400'}>
                          {entry.margin_impact > 0 ? '+' : ''}${entry.margin_impact}
                        </div>
                      )}
                      {entry.risk_assessment && (
                        <div className="text-zinc-400 text-xs">Risk: {entry.risk_assessment}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <div className="text-center mt-4">
          <button className="text-zinc-400 hover:text-white text-sm">
            Load more...
          </button>
        </div>
      )}
    </div>
  )
}
