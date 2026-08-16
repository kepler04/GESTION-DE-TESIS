const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

/** Se dispara cuando el backend rechaza el token: la app cierra sesión. */
let onUnauthorized = () => {}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

function token() {
  return localStorage.getItem('token')
}

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })

  if (res.status === 401) {
    onUnauthorized()
    throw new Error('Tu sesión expiró. Volvé a iniciar sesión.')
  }

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? 'Error inesperado')
  return data
}
