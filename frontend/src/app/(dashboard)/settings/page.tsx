'use client'

import { useAuth } from '@/lib/auth-context'

export default function Settings() {
  const { user, logout } = useAuth()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      
      <div className="max-w-2xl space-y-6">
        {/* User Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Name</span>
              <span className="text-white">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Email</span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Role</span>
              <span className="text-white capitalize">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Sign Out
          </button>
        </div>

        {/* Autonomy Controls */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Autonomy Controls</h2>
          <p className="text-zinc-500">Global autonomy settings coming soon...</p>
        </div>

        {/* Thresholds */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Thresholds</h2>
          <p className="text-zinc-500">Global threshold settings coming soon...</p>
        </div>

        {/* Integrations */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Integrations</h2>
          <p className="text-zinc-500">API connections coming soon...</p>
        </div>
      </div>
    </div>
  )
}
