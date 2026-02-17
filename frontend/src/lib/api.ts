const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function api(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  return res.json()
}

// API helpers
export const portfolio = {
  get: () => api('/api/v1/portfolio'),
  getAllocation: () => api('/api/v1/portfolio/allocation'),
}

export const creators = {
  list: () => api('/api/v1/creators'),
  get: (id: string) => api(`/api/v1/creators/${id}`),
  create: (data: any) => api('/api/v1/creators', { method: 'POST', body: JSON.stringify(data) }),
  setAutonomy: (id: string, level: number) => 
    api(`/api/v1/creators/${id}/autonomy`, { method: 'PUT', body: JSON.stringify({ level }) }),
}

export const agents = {
  get: (id: string) => api(`/api/v1/agents/${id}`),
  setAutonomy: (id: string, level: number) => 
    api(`/api/v1/agents/${id}/autonomy`, { method: 'PUT', body: JSON.stringify({ level }) }),
}

export const tasks = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return api(`/api/v1/tasks${query}`)
  },
  create: (data: any) => api('/api/v1/tasks', { method: 'POST', body: JSON.stringify(data) }),
}

export const activity = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return api(`/api/v1/activity${query}`)
  },
  digest: () => api('/api/v1/activity/digest'),
}

export const approvals = {
  list: () => api('/api/v1/approvals'),
  get: (id: string) => api(`/api/v1/approvals/${id}`),
  approve: (id: string, comment?: string) => 
    api(`/api/v1/approvals/${id}/approve`, { method: 'POST', body: JSON.stringify({ comment }) }),
  reject: (id: string, comment?: string) => 
    api(`/api/v1/approvals/${id}/reject`, { method: 'POST', body: JSON.stringify({ comment }) }),
}
