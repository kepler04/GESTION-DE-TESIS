import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { apiBlob, apiDescargarArchivo } from '../api/tesistrack'
import { esImagen, esPdf, esPrevisualizable } from '../utils/archivos'

/**
 * Visor modal de un archivo: una imagen (`<img>`) o un PDF (`<iframe>`) sin
 * descargarlo.
 *
 * **Seguridad.** Esto muestra contenido que subió una persona, dentro de la
 * aplicación, así que las reglas son estrictas:
 * - Solo se abre si `tipo` es uno de los cinco que el **backend verificó por los
 *   bytes** al subir el archivo (PNG, JPEG, GIF, WebP, PDF). El tipo no es el que
 *   declaró quien lo subió, y un SVG o un HTML disfrazado queda como binario
 *   genérico: acá ni se intenta abrir.
 * - El contenido llega por `fetch` con el token y se arma como `Blob` **con ese
 *   tipo verificado**, no con el que diga la respuesta. Nada se renderiza desde una
 *   URL del servidor.
 * - El `URL.createObjectURL` se **revoca** al cerrar o desmontar: si no, el archivo
 *   queda en memoria hasta recargar la página.
 * - El endpoint de descarga sigue sirviendo `attachment`: abrir esa dirección en el
 *   navegador baja el archivo, no lo ejecuta.
 */
export default function VisorArchivo({ titulo, nombreArchivo, tipo, ruta, onCerrar }) {
  const dialogo = useRef(null)
  const [url, setUrl] = useState(null)
  const [error, setError] = useState(null)
  const [bajando, setBajando] = useState(false)

  useEffect(() => {
    dialogo.current?.showModal()
  }, [])

  useEffect(() => {
    // Defensa en profundidad: aunque quien lo use no lo haya filtrado, un tipo que
    // no es previsualizable nunca llega a pedirse ni a mostrarse.
    if (!esPrevisualizable(tipo)) {
      setError('Este tipo de archivo no se puede previsualizar: descargalo para abrirlo.')
      return undefined
    }
    let cancelado = false
    let creada = null
    apiBlob(ruta)
      .then((blob) => {
        if (cancelado) return
        creada = URL.createObjectURL(new Blob([blob], { type: tipo }))
        setUrl(creada)
      })
      .catch((e) => !cancelado && setError(e.message))
    return () => {
      cancelado = true
      if (creada) URL.revokeObjectURL(creada)
    }
  }, [ruta, tipo])

  async function handleDescargar() {
    setBajando(true)
    try {
      await apiDescargarArchivo(ruta, nombreArchivo)
    } catch (e) {
      setError(e.message)
    } finally {
      setBajando(false)
    }
  }

  return createPortal(
    <dialog className="dialogo visor" ref={dialogo} onClose={onCerrar}>
      <div className="visor__cabecera">
        <h2 className="visor__titulo">{titulo}</h2>
        <div className="acciones-fila">
          <button type="button" className="btn btn--sutil" onClick={handleDescargar} disabled={bajando}>
            {bajando ? 'Descargando…' : 'Descargar'}
          </button>
          <button type="button" className="btn btn--primario" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>

      <div className="visor__cuerpo">
        {error && (
          <p className="alerta" role="alert">
            {error}
          </p>
        )}
        {!url && !error && <p className="estado-carga">Abriendo…</p>}
        {url && esImagen(tipo) && <img className="visor__imagen" src={url} alt={titulo} />}
        {url && esPdf(tipo) && <iframe className="visor__pdf" src={url} title={titulo} />}
      </div>
    </dialog>,
    document.body,
  )
}
