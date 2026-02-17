'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { agents as agentsApi } from '@/lib/api'
import { ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react'

export default function AgentWorkspace() {
  const params = useParams()
  const [agent, setAgent] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [decisions, setDecisions] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('tasks')

  useEffect(() => {
    if (params.id) {
      agentsApi.get(params.id as string).then(data => {
        setAgent(data.agent)
        setTasks(data.tasks)
        setDecisions(data.decisions)
        setActivity(data.activity)
      }).catch(console.error)
    }
  }, [params.id])

  if (!agent) {
    return <div className="p-6 text-zinc-400">Loading...</div>
  }

  const tabs = ['tasks', 'kpis', 'decisions', 'outputs', 'timeline']
  const autonomyLabel = ['L0 Advisory', 'L1 Assisted', 'L2 Conditional', 'L3 Full Auto']

  const priorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertCircle size={14} className="text-red-400" />
      case 'high': return <Clock size={14} className="text-yellow-400" />
      default: return <CheckCircle size={14} className="text-zinc-400" />
    }
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
        <Link href="/" className="hover:text-white">Command Center</Link>
        <ChevronRight size={14} />
        <span className="text-white">{agent.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
          <p className="text-zinc-400">{agent.cluster} cluster</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={agent.autonomy_level}
            className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
            onChange={(e) => {/* Handle autonomy change */}}
          >
            {autonomyLabel.map((label, i) => (
              <option key={i} value={i}>{label}</option>
            ))}
          </select>
          <span className={`px-3 py-1 rounded text-sm ${
            agent.risk_index < 30 ? 'bg-green-500/20 text-green-400' :
            agent.risk_index < 50 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            Risk: {agent.risk_index}
          </span>
          <span className={`w-3 h-3 rounded-full ${agent.status === 'active' ? 'bg-green-500' : 'bg-zinc-500'}`} />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Sidebar - Task Queue & Stats */}
        <div className="w-64 flex-shrink-0 space-y-4">
          {/* Task Queue */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Task Queue</h3>
            <div className="space-y-2">
              {tasks.filter(t => t.status !== 'completed').slice(0, 5).map(task => (
                <div
                  key={task.id}
                  className={`p-2 rounded cursor-pointer ${
                    task.priority === 'critical' ? 'bg-red-500/10 border border-red-500/30' :
                    task.priority === 'high' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                    'bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {priorityIcon(task.priority)}
                    <span className="text-sm text-white truncate">{task.title}</span>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status !== 'completed').length === 0 && (
                <div className="text-zinc-500 text-sm">No pending tasks</div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Accuracy</span>
                <span className="text-white">{agent.accuracy_score}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">SLA</span>
                <span className="text-white">{agent.sla_adherence}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Rollbacks (30d)</span>
                <span className="text-white">{agent.rollback_count_30d}</span>
              </div>
            </div>
          </div>

          {/* KPIs Owned */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">KPIs Owned</h3>
            <div className="space-y-1">
              {(agent.kpis_owned || ['ROAS', 'CPA', 'Spend']).map((kpi: string) => (
                <div key={kpi} className="flex justify-between text-sm">
                  <span className="text-zinc-400">{kpi}</span>
                  <span className="text-green-400">●</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-zinc-800 mb-4">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 min-h-[400px]">
            {activeTab === 'tasks' && (
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="p-4 bg-zinc-800 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {priorityIcon(task.priority)}
                          <span className="text-white font-medium">{task.title}</span>
                        </div>
                        {task.description && (
                          <p className="text-zinc-400 text-sm mt-1">{task.description}</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-zinc-700 text-zinc-300'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-zinc-500 text-center py-8">No tasks</div>
                )}
              </div>
            )}

            {activeTab === 'decisions' && (
              <div className="space-y-3">
                {decisions.map(decision => (
                  <div key={decision.id} className="p-4 bg-zinc-800 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-white">{decision.decision}</span>
                        <div className="text-zinc-500 text-xs mt-1">
                          Rule: {decision.rule_triggered || 'Manual'}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        decision.status === 'executed' ? 'bg-green-500/20 text-green-400' :
                        decision.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                        decision.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {decision.status}
                      </span>
                    </div>
                  </div>
                ))}
                {decisions.length === 0 && (
                  <div className="text-zinc-500 text-center py-8">No decisions</div>
                )}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-2">
                {activity.map(entry => (
                  <div key={entry.id} className="flex gap-3 p-2">
                    <div className="text-zinc-500 text-xs w-16">
                      {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      entry.event_level === 1 ? 'bg-red-500' :
                      entry.event_level === 2 ? 'bg-yellow-500' :
                      'bg-zinc-500'
                    }`} />
                    <div className="text-sm text-white">{entry.title}</div>
                  </div>
                ))}
                {activity.length === 0 && (
                  <div className="text-zinc-500 text-center py-8">No activity</div>
                )}
              </div>
            )}

            {(activeTab === 'kpis' || activeTab === 'outputs') && (
              <div className="text-zinc-500 text-center py-8">
                Coming soon...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
