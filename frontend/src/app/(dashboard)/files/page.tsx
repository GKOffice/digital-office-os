'use client'

import { FolderOpen, FileText, ChevronRight } from 'lucide-react'

export default function FileSystem() {
  const mockFiles = [
    { type: 'folder', name: 'Creator A', children: 4 },
    { type: 'folder', name: 'Creator B', children: 3 },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">File System</h1>
      
      <div className="flex gap-6">
        {/* File Tree */}
        <div className="w-80 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 p-2 bg-zinc-800 rounded text-white">
              <FolderOpen size={16} />
              <span>Portfolio</span>
            </div>
            {mockFiles.map(file => (
              <div key={file.name} className="ml-4">
                <div className="flex items-center gap-2 p-2 hover:bg-zinc-800 rounded text-zinc-300 cursor-pointer">
                  <ChevronRight size={14} />
                  <FolderOpen size={16} />
                  <span>{file.name}</span>
                  <span className="text-zinc-500 text-xs ml-auto">({file.children})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* File Details */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <p className="text-zinc-500">Select a file to view details</p>
        </div>
      </div>
    </div>
  )
}
