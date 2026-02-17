'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  BarChart3, 
  Users, 
  Bot, 
  Zap, 
  FolderOpen, 
  Activity, 
  Settings,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Clock
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { creators as creatorsApi, approvals as approvalsApi } from '@/lib/api'

interface Creator {
  id: string
  name: string
  tier: string
  status: string
}

export default function Sidebar() {
  const pathname = usePathname()
  const [creators, setCreators] = useState<Creator[]>([])
  const [creatorsExpanded, setCreatorsExpanded] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [criticalCount, setCriticalCount] = useState(0)

  useEffect(() => {
    creatorsApi.list().then(data => setCreators(data.creators)).catch(console.error)
    approvalsApi.list().then(data => setPendingCount(data.approvals.length)).catch(console.error)
  }, [])

  const navItems = [
    { href: '/', icon: Home, label: 'Command Center' },
    { href: '/portfolio', icon: BarChart3, label: 'Portfolio' },
  ]

  const bottomItems = [
    { href: '/war-room', icon: Bot, label: 'War Room' },
    { href: '/execution', icon: Zap, label: 'Execution Console', badge: pendingCount },
    { href: '/files', icon: FolderOpen, label: 'File System' },
    { href: '/activity', icon: Activity, label: 'Activity Log' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const tierColor = (tier: string) => {
    switch (tier) {
      case 'S': return 'text-green-400'
      case 'A': return 'text-blue-400'
      case 'B': return 'text-yellow-400'
      case 'C': return 'text-orange-400'
      case 'X': return 'text-red-400'
      default: return 'text-zinc-400'
    }
  }

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-zinc-800">
        <h1 className="text-lg font-bold text-white">Digital Office</h1>
        <p className="text-xs text-zinc-500">Empire Command Center</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {/* Main nav */}
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
              isActive(item.href)
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}

        {/* Creators section */}
        <div className="mt-4">
          <button
            onClick={() => setCreatorsExpanded(!creatorsExpanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-zinc-400 hover:text-white"
          >
            {creatorsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Users size={18} />
            <span className="text-sm font-medium">Creators</span>
          </button>

          {creatorsExpanded && (
            <div className="ml-4 mt-1">
              {creators.map(creator => (
                <Link
                  key={creator.id}
                  href={`/creators/${creator.id}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                    pathname.startsWith(`/creators/${creator.id}`)
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    creator.status === 'active' ? 'bg-green-500' : 'bg-zinc-500'
                  }`} />
                  <span className="truncate">{creator.name}</span>
                  <span className={`text-xs ${tierColor(creator.tier)}`}>{creator.tier}</span>
                </Link>
              ))}
              <Link
                href="/creators/new"
                className="flex items-center gap-2 px-3 py-1.5 text-zinc-500 hover:text-white text-sm"
              >
                + Add Creator
              </Link>
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="mt-4">
          {bottomItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm flex-1">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="px-1.5 py-0.5 bg-yellow-500 text-black text-xs rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer alerts */}
      <div className="p-3 border-t border-zinc-800 space-y-1">
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            <span>{criticalCount} Critical Alerts</span>
          </div>
        )}
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <Clock size={16} />
            <span>{pendingCount} Pending Approvals</span>
          </div>
        )}
      </div>
    </aside>
  )
}
