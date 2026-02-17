'use client'

export default function WarRoom() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">War Room</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">All Agents</h2>
          <p className="text-zinc-500">Cross-agent visibility coming soon...</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Escalations</h2>
          <p className="text-zinc-500">No active escalations</p>
        </div>
      </div>
    </div>
  )
}
