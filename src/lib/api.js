const API_BASE = '/api'

let authToken = null

export function setAuthToken(token) {
  authToken = token
}

export function clearAuthToken() {
  authToken = null
}

export function getAuthToken() {
  return authToken
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(body.error || `请求失败 (${res.status})`)
  }

  return body
}

export function get(path) {
  return request(path)
}

export function put(path, data) {
  return request(path, { method: 'PUT', body: JSON.stringify(data) })
}

export function post(path, data) {
  return request(path, { method: 'POST', body: JSON.stringify(data) })
}
