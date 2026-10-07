/** `1 tesis` / `2 tesis`, `1 carpeta` / `2 carpetas`. */
export function plural(n, singular, plural = `${singular}s`) {
  return `${n} ${n === 1 ? singular : plural}`
}

/** Fecha y hora local con el formato que espera un `<input type="datetime-local">`. */
export function aInputLocal(valor = new Date()) {
  const d = new Date(valor)
  const dos = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`
}

/** Lo que el usuario eligió en el `datetime-local` (hora local) como instante ISO para la API. */
export function desdeInputLocal(valor) {
  return new Date(valor).toISOString()
}

/** Mañana a las 10:00: un valor de partida razonable al programar una reunión. */
export function mananaALas10() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(10, 0, 0, 0)
  return aInputLocal(d)
}

export function tamano(bytes) {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** El sitio de un enlace, para mostrarlo sin la dirección entera. */
export function dominio(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** "hoy", "hace 1 día", "hace 5 días": cuánto lleva esperando algo, de un vistazo. */
export function haceTiempo(valor) {
  if (!valor) return ''
  const dias = Math.floor((Date.now() - new Date(valor).getTime()) / 86400000)
  if (dias <= 0) return 'hoy'
  return `hace ${plural(dias, 'día')}`
}
