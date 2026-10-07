const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

/** Se dispara cuando el backend rechaza el token: la app cierra sesión. */
let onUnauthorized = () => {}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

function token() {
  return localStorage.getItem('token')
}

/**
 * Texto para mostrar cuando el backend responde con error.
 *
 * Un 5xx es un fallo que nadie previó, y Spring lo devuelve como
 * `{"error": "Internal Server Error"}`: mostrarlo tal cual no le dice nada a quien
 * lo ve. Los errores que sí se previeron (4xx) traen su propio mensaje en español.
 */
function mensajeDeError(res, data, porDefecto) {
  if (res.status >= 500) {
    return 'Algo falló de nuestro lado. Probá de nuevo en un momento; si sigue pasando, avisanos.'
  }
  return data?.error ?? porDefecto
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
  if (!res.ok) throw new Error(mensajeDeError(res, data, 'Error inesperado'))
  return data
}

/**
 * Sube un archivo. No usa {@link api} porque el `Content-Type: application/json`
 * fijo rompería el multipart: el navegador tiene que poner el suyo con el boundary,
 * y para eso hay que **no** mandar la cabecera.
 */
export async function apiSubirArchivo(path, archivo) {
  const datos = new FormData()
  datos.append('archivo', archivo)

  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
    body: datos,
  })

  if (res.status === 401) {
    onUnauthorized()
    throw new Error('Tu sesión expiró. Volvé a iniciar sesión.')
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(mensajeDeError(res, data, 'No se pudo subir el archivo'))
  return data
}

/**
 * Descarga un archivo protegido y dispara el "guardar como".
 *
 * Va por `fetch` y no por un enlace directo porque la descarga necesita el token
 * en la cabecera, y un `<a href>` no puede mandarlo.
 */
export async function apiDescargarArchivo(path, nombreSugerido) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
  })

  if (res.status === 401) {
    onUnauthorized()
    throw new Error('Tu sesión expiró. Volvé a iniciar sesión.')
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(mensajeDeError(res, data, 'No se pudo descargar el archivo'))
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreSugerido ?? 'entrega'
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  // Sin esto el blob queda en memoria hasta que se recargue la página.
  URL.revokeObjectURL(url)
}
