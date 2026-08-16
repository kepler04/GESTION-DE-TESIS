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

/**
 * El registro es de dos pasos en pantalla pero un solo POST: las credenciales
 * del paso 1 y el perfil del paso 2 viajan juntas al final, así nadie queda con
 * una cuenta a medio crear por abandonar el formulario.
 */
export function register({
  name,
  email,
  password,
  role,
  telefono,
  ubicacion,
  carrera,
  organizacion,
  aceptaPolitica,
}) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
      role,
      telefono,
      ubicacion,
      carrera,
      organizacion,
      aceptaPolitica,
    }),
  })
}

/**
 * ¿Ese correo ya tiene cuenta? Se consulta al salir del paso 1 para no hacer
 * completar todo el perfil y fallar al final. El backend limita la frecuencia.
 */
export function existeEmail(email) {
  return request(`/api/auth/existe?email=${encodeURIComponent(email)}`)
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
