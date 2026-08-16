const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? 'Error inesperado')
  }

  return data
}

export function register({ name, email, password, role }) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  })
}

export function login({ email, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getMe(token) {
  return request('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
