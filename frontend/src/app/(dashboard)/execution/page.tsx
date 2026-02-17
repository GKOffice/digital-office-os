'use client'

import { useEffect, useState } from 'react'
import { approvals as approvalsApi } from '@/lib/api'
import { Check, X, MessageSquare, Pause, AlertTriangle } from 'lucide-react'

export default function ExecutionConsole() {
  const [approvals, setApprovals] = useState<any[]>([])
  const [selectedApproval, setSelectedApproval] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('approvals')

  useEffect(() => {
    loadApprovals()
  }, [])

  const loadApprovals = async () => {
    try {
      const data = await approvalsApi.list()
      setApprovals(data.approvals)
      if (data.approvals.length > 0 && !selectedApproval) {
        setSelectedApproval(data.approvals[0])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approvalsApi.approve(id)
      loadApprovals()
    } catch (err) {
      console.error(err)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await approvalsApi.reject(id)
      loadApprovals()
    } catch (err) {
      console.error(err)
    }
  }

  const tabs = [
    { id: 'approvals', label: `Approvals (${approvals.length})` },
    { id: 'api-queue', label: 'API Queue' },
    { id: 'risk-alerts', label: 'Risk Alerts' },
    { id: 'rollback', label: 'Rollback' },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Execution Console</h1>
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2">
          <AlertTriangle size={18} />
          Emergency Freeze All
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-blue-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {approvals.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No pending approvals
            </div>
          ) : (
            approvals.map(approval => (
              <div
                key={approval.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        approval.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                        approval.priority === 'high' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-zinc-700 text-zinc-300'
                      }`}>
                        {approval.priority}
                      </span>
                      <span className="text-white font-medium">{approval.decision_type?.toUpperCase()}</span>
                    </div>
                    <p className="text-zinc-400 mt-1">{approval.decision}</p>
                    <p className="text-zinc-500 text-sm mt-1">
                      {approval.creator_name} • {approval.agent_name}
                    </p>
                  </div>
                  <div className="text-zinc-500 text-sm">
                    Waiting: {Math.floor((Date.now() - new Date(approval.created_at).getTime()) / 60000)}m
                  </div>
                </div>

                {/* Justification */}
                {approval.inputs && (
                  <div className="bg-zinc-800 rounded p-3 mb-4">
                    <div className="text-sm font-medium text-zinc-300 mb-2">Justification</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(approval.inputs.metrics || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-zinc-400">{key}:</span>
                          <span className="text-white">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projected Impact */}
                {approval.projected_impact && (
                  <div className="bg-zinc-800 rounded p-3 mb-4">
                    <div className="text-sm font-medium text-zinc-300 mb-2">Projected Impact</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {Object.entries(approval.projected_impact).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-zinc-400 block">{key}</span>
                          <span className="text-white">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(approval.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2"
                  >
                    <Check size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(approval.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-2"
                  >
                    <X size={16} />
                    Reject
                  </button>
                  <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded flex items-center gap-2">
                    <MessageSquare size={16} />
                    Comment
                  </button>
                  <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded flex items-center gap-2">
                    <Pause size={16} />
                    Defer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab !== 'approvals' && (
        <div className="text-center py-12 text-zinc-500">
          {activeTab === 'api-queue' && 'API execution queue coming soon...'}
          {activeTab === 'risk-alerts' && 'Risk alerts coming soon...'}
          {activeTab === 'rollback' && 'Rollback center coming soon...'}
        </div>
      )}
    </div>
  )
}
