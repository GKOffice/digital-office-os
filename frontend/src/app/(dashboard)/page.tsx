'use client'

import { useEffect, useState } from 'react'
import { portfolio, creators as creatorsApi, approvals as approvalsApi, activity } from '@/lib/api'
import { TrendingUp, TrendingDown, AlertCircle, Clock, CheckCircle } from 'lucide-react'

interface Metrics {
  totalRevenue: number
  revenueChange: number
  roas: number
  roasChange: number
  cpa: number
  cpaChange: number
  ltvCac: number
  ltvCacChange: number
  riskIndex: number
  riskChange: number
}

export default function CommandCenter() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [creators, setCreators] = useState<any[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [digest, setDigest] = useState<any>(null)

  useEffect(() => {
    portfolio.get().then(data => setMetrics(data.metrics)).catch(console.error)
    creatorsApi.list().then(data => setCreators(data.creators)).catch(console.error)
    approvalsApi.list().then(data => setPendingApprovals(data.approvals)).catch(console.error)
    activity.list({ level: '2' }).then(data => setRecentActivity(data.activity)).catch(console.error)
    activity.digest().then(data => setDigest(data)).catch(console.error)
  }, [])

  const MetricCard = ({ label, value, change, format = 'number', good = 'up' }: any) => {
    const isPositive = good === 'up' ? change > 0 : change < 0
    const formatted = format === 'currency' 
      ? `$${value.toLocaleString()}` 
      : format === 'percent' 
        ? `${value}%`
        : value

    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="text-zinc-400 text-sm mb-1">{label}</div>
        <div className="text-2xl font-bold text-white">{formatted}</div>
        <div className={`flex items-center gap-1 text-sm mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{change > 0 ? '+' : ''}{change}{format === 'currency' ? '' : ''}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Command Center</h1>

      {/* KPI Grid */}
      {metrics && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <MetricCard label="Revenue" value={metrics.totalRevenue} change={metrics.revenueChange} format="currency" />
          <MetricCard label="ROAS" value={metrics.roas} change={metrics.roasChange} />
          <MetricCard label="CPA" value={metrics.cpa} change={metrics.cpaChange} format="currency" good="down" />
          <MetricCard label="LTV/CAC" value={metrics.ltvCac} change={metrics.ltvCacChange} />
          <MetricCard label="Risk Index" value={metrics.riskIndex} change={metrics.riskChange} good="down" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Critical Alerts */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-400" size={20} />
            Critical Alerts
          </h2>
          {digest?.critical?.length > 0 ? (
            <div className="space-y-2">
              {digest.critical.slice(0, 5).map((alert: any) => (
                <div key={alert.id} className="flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                  <span className="text-red-400 text-sm">{alert.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-zinc-500 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              No critical alerts
            </div>
          )}
        </div>

        {/* Pending Approvals */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="text-yellow-400" size={20} />
            Pending Approvals ({pendingApprovals.length})
          </h2>
          {pendingApprovals.length > 0 ? (
            <div className="space-y-2">
              {pendingApprovals.slice(0, 5).map((approval: any) => (
                <div key={approval.id} className="flex items-center justify-between p-2 bg-zinc-800 rounded">
                  <div>
                    <div className="text-white text-sm">{approval.decision}</div>
                    <div className="text-zinc-400 text-xs">{approval.creator_name} • {approval.agent_name}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    approval.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                    approval.priority === 'high' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-zinc-700 text-zinc-300'
                  }`}>
                    {approval.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-zinc-500">No pending approvals</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Creator Ranking */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Creator Ranking</h2>
          <div className="space-y-2">
            {creators.slice(0, 5).map((creator, index) => (
              <div key={creator.id} className="flex items-center gap-3 p-2 bg-zinc-800 rounded">
                <span className="text-zinc-500 w-6">{index + 1}.</span>
                <span className={`w-2 h-2 rounded-full ${creator.status === 'active' ? 'bg-green-500' : 'bg-zinc-500'}`} />
                <span className="text-white flex-1">{creator.name}</span>
                <span className={`text-sm font-medium ${
                  creator.tier === 'S' ? 'text-green-400' :
                  creator.tier === 'A' ? 'text-blue-400' :
                  creator.tier === 'B' ? 'text-yellow-400' :
                  'text-zinc-400'
                }`}>
                  {creator.tier}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Today's Activity</h2>
          {digest?.summary && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-zinc-800 rounded">
                <div className="text-2xl font-bold text-white">{digest.summary.decisions || 0}</div>
                <div className="text-zinc-400 text-sm">Decisions</div>
              </div>
              <div className="text-center p-3 bg-zinc-800 rounded">
                <div className="text-2xl font-bold text-white">{digest.summary.executions || 0}</div>
                <div className="text-zinc-400 text-sm">Executions</div>
              </div>
              <div className="text-center p-3 bg-zinc-800 rounded">
                <div className="text-2xl font-bold text-white">{digest.summary.rollbacks || 0}</div>
                <div className="text-zinc-400 text-sm">Rollbacks</div>
              </div>
              <div className="text-center p-3 bg-zinc-800 rounded">
                <div className="text-2xl font-bold text-white">{digest.summary.errors || 0}</div>
                <div className="text-zinc-400 text-sm">Errors</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
