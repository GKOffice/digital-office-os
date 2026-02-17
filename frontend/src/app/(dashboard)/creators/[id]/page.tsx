'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { creators as creatorsApi } from '@/lib/api'
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'

export default function CreatorDashboard() {
  const params = useParams()
  const [creator, setCreator] = useState<any>(null)
  const [agents, setAgents] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])

  useEffect(() => {
    if (params.id) {
      creatorsApi.get(params.id as string).then(data => {
        setCreator(data.creator)
        setAgents(data.agents)
        setActivity(data.activity)
      }).catch(console.error)
    }
  }, [params.id])

  if (!creator) {
    return <div className="p-6 text-zinc-400">Loading...</div>
  }

  const metrics = [
    { label: 'Revenue', value: '$32,410', change: '+18%', positive: true },
    { label: 'ROAS', value: '2.8', change: '+0.4', positive: true },
    { label: 'CPA', value: '$72', change: '-$8', positive: true },
    { label: 'CVR', value: '4.2%', change: '+0.5%', positive: true },
    { label: 'LTV', value: '$285', change: '+$32', positive: true },
    { label: 'Margin', value: '42%', change: '+3%', positive: true },
    { label: 'Refund %', value: '3.2%', change: '-0.8%', positive: true },
    { label: 'Data Conf', value: `${creator.current_data_confidence}%`, change: '+5%', positive: true },
    { label: 'Risk Idx', value: creator.current_risk_index, change: '-8', positive: true },
    { label: 'Growth', value: '78', change: '+12', positive: true },
  ]

  const autonomyLabel = ['L0 Advisory', 'L1 Assisted', 'L2 Conditional', 'L3 Full Auto']

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
        <Link href="/" className="hover:text-white">Command Center</Link>
        <ChevronRight size={14} />
        <Link href="/portfolio" className="hover:text-white">Creators</Link>
        <ChevronRight size={14} />
        <span className="text-white">{creator.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{creator.name}</h1>
          <p className="text-zinc-400">{creator.brand_name}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            creator.tier === 'S' ? 'bg-green-500/20 text-green-400' :
            creator.tier === 'A' ? 'bg-blue-500/20 text-blue-400' :
            creator.tier === 'B' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-zinc-700 text-zinc-300'
          }`}>
            Tier {creator.tier}
          </span>
          <span className="px-3 py-1 bg-zinc-800 rounded text-sm text-zinc-300">
            {autonomyLabel[creator.autonomy_level]}
          </span>
          <span className="px-3 py-1 bg-zinc-800 rounded text-sm text-zinc-300">
            Risk: {creator.current_risk_index}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800 mb-6">
        {['Dashboard', 'Agents', 'Offers', 'Funnels', 'Campaigns', 'Creatives'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === 'Dashboard'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {metrics.slice(0, 5).map(m => (
          <div key={m.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-zinc-400 text-sm">{m.label}</div>
            <div className="text-xl font-bold text-white mt-1">{m.value}</div>
            <div className={`flex items-center gap-1 text-sm mt-1 ${m.positive ? 'text-green-400' : 'text-red-400'}`}>
              {m.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {m.change}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-4 mb-6">
        {metrics.slice(5).map(m => (
          <div key={m.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-zinc-400 text-sm">{m.label}</div>
            <div className="text-xl font-bold text-white mt-1">{m.value}</div>
            <div className={`flex items-center gap-1 text-sm mt-1 ${m.positive ? 'text-green-400' : 'text-red-400'}`}>
              {m.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {m.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Agent Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Agent Status ({agents.length})</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {agents.map(agent => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="flex items-center justify-between p-2 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500' : 'bg-zinc-500'}`} />
                  <span className="text-white text-sm">{agent.name}</span>
                </div>
                <span className="text-xs text-zinc-400">L{agent.autonomy_level}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {activity.length > 0 ? activity.map(entry => (
              <div key={entry.id} className="p-2 bg-zinc-800 rounded">
                <div className="text-white text-sm">{entry.title}</div>
                <div className="text-zinc-500 text-xs mt-1">
                  {new Date(entry.created_at).toLocaleTimeString()}
                </div>
              </div>
            )) : (
              <div className="text-zinc-500 text-sm">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
