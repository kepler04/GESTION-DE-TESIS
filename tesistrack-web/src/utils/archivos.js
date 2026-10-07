/**
 * Qué archivos se pueden previsualizar en la aplicación.
 *
 * Son exactamente los cinco tipos que el backend reconoce **por los bytes** del
 * archivo al subirlo (ver `ArchivoTipos`): PNG, JPEG, GIF, WebP y PDF. El tipo que
 * llega en `archivoTipo` ya es el verificado, nunca el que declaró quien lo subió.
 * Todo lo demás —SVG, HTML, Word, PowerPoint— queda como `application/octet-stream`
 * y se descarga, sin excepción.
 */
export const IMAGENES_PREVISUALIZABLES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
export const PDF = 'application/pdf'

export function esImagen(tipo) {
  return IMAGENES_PREVISUALIZABLES.includes(tipo)
}

export function esPdf(tipo) {
  return tipo === PDF
}

export function esPrevisualizable(tipo) {
  return esImagen(tipo) || esPdf(tipo)
}
