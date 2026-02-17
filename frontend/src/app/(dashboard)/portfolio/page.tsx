'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { portfolio, creators as creatorsApi } from '@/lib/api'

export default function PortfolioPage() {
  const [data, setData] = useState<any>(null)
  const [creators, setCreators] = useState<any[]>([])

  useEffect(() => {
    portfolio.get().then(setData).catch(console.error)
    creatorsApi.list().then(d => setCreators(d.creators)).catch(console.error)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Portfolio</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800 mb-6">
        {['Overview', 'Allocation', 'Performance', 'Risk Map'].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              i === 0
                ? 'border-blue-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Creator Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left p-4 text-zinc-400 font-medium">Creator</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Tier</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Status</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Autonomy</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Performance</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Risk</th>
              <th className="text-left p-4 text-zinc-400 font-medium">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {creators.map(creator => (
              <tr key={creator.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="p-4">
                  <Link href={`/creators/${creator.id}`} className="text-white hover:text-blue-400">
                    {creator.name}
                  </Link>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    creator.tier === 'S' ? 'bg-green-500/20 text-green-400' :
                    creator.tier === 'A' ? 'bg-blue-500/20 text-blue-400' :
                    creator.tier === 'B' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-zinc-700 text-zinc-300'
                  }`}>
                    {creator.tier}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`flex items-center gap-2 ${
                    creator.status === 'active' ? 'text-green-400' : 'text-zinc-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      creator.status === 'active' ? 'bg-green-500' : 'bg-zinc-500'
                    }`} />
                    {creator.status}
                  </span>
                </td>
                <td className="p-4 text-zinc-300">L{creator.autonomy_level}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${creator.current_performance_score}%` }}
                      />
                    </div>
                    <span className="text-zinc-300 text-sm">{creator.current_performance_score}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`${
                    creator.current_risk_index < 30 ? 'text-green-400' :
                    creator.current_risk_index < 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {creator.current_risk_index}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`${
                    creator.current_data_confidence >= 80 ? 'text-green-400' :
                    creator.current_data_confidence >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {creator.current_data_confidence}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
