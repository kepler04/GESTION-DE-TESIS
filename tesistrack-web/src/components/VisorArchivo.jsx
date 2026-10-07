import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  apiBlob,
  apiDescargarArchivo,
  cambiarEstadoEntrega,
  crearObservacion,
  listarObservaciones,
} from '../api/tesistrack'
import EstadoBadge from './EstadoBadge'
import Icono from './Icono'
import { fechaHora } from './ui'
import { esImagen, esPdf, esPrevisualizable } from '../utils/archivos'
import { tamano as formatoTamano } from '../utils/formato'

const ZOOM_MIN = 50
const ZOOM_MAX = 300
const ZOOM_PASO = 25

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
 *
 * Con `entregaId`, al costado van las observaciones de esa versión; con `revisable`
 * (el profesor del grupo), además el dictamen: observar o aprobar sin salir del
 * visor. El backend vuelve a verificar que sea el profesor del grupo.
 *
 * El zoom es solo para imágenes: el PDF lo muestra el visor del navegador, que ya
 * trae el suyo.
 */
export default function VisorArchivo({
  titulo,
  nombreArchivo,
  tipo,
  ruta,
  tamano,
  detalle,
  fecha,
  entregaId,
  estado,
  revisable = false,
  onCambio,
  onCerrar,
}) {
  const dialogo = useRef(null)
  const [url, setUrl] = useState(null)
  const [error, setError] = useState(null)
  const [bajando, setBajando] = useState(false)
  const [zoom, setZoom] = useState(100)

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

  const meta = [
    esPdf(tipo) ? 'PDF' : esImagen(tipo) ? 'Imagen' : null,
    tamano != null ? formatoTamano(tamano) : null,
    detalle,
    fecha ? fechaHora(fecha) : null,
  ].filter(Boolean)

  return createPortal(
    <dialog className="dialogo visor" ref={dialogo} onClose={onCerrar} aria-labelledby="visor-titulo">
      <div className="visor__barra">
        <div className="visor__archivo">
          <Icono nombre="tesis" />
          <div>
            <h2 className="visor__titulo" id="visor-titulo">
              {titulo}
            </h2>
            {meta.length > 0 && <p className="visor__meta">{meta.join(' · ')}</p>}
          </div>
        </div>

        <div className="visor__controles">
          {esImagen(tipo) && url && (
            <div className="visor__zoom" role="group" aria-label="Zoom">
              <button
                type="button"
                className="visor__btn-osc"
                onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_PASO))}
                disabled={zoom <= ZOOM_MIN}
                aria-label="Alejar"
              >
                <Icono nombre="menos" />
              </button>
              <output aria-live="polite">{zoom}%</output>
              <button
                type="button"
                className="visor__btn-osc"
                onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_PASO))}
                disabled={zoom >= ZOOM_MAX}
                aria-label="Acercar"
              >
                <Icono nombre="mas" />
              </button>
            </div>
          )}
          <button
            type="button"
            className="visor__btn-osc visor__btn-claro"
            onClick={handleDescargar}
            disabled={bajando}
          >
            <Icono nombre="descargar" />
            {bajando ? 'Descargando…' : 'Descargar'}
          </button>
          <button type="button" className="visor__btn-osc" onClick={onCerrar}>
            <Icono nombre="cerrar" />
            Cerrar
          </button>
        </div>
      </div>

      <div className="visor__zona">
        <div className="visor__cuerpo">
          {error && (
            <p className="alerta" role="alert">
              {error}
            </p>
          )}
          {!url && !error && <p className="estado-carga">Abriendo…</p>}
          {url && esImagen(tipo) && (
            <img
              className="visor__imagen"
              src={url}
              alt={titulo}
              style={{ transform: `scale(${zoom / 100})` }}
            />
          )}
          {url && esPdf(tipo) && <iframe className="visor__pdf" src={url} title={titulo} />}
        </div>

        {entregaId && (
          <PanelObservaciones
            entregaId={entregaId}
            estado={estado}
            revisable={revisable}
            onCambio={onCambio}
          />
        )}
      </div>
    </dialog>,
    document.body,
  )
}

/**
 * Las observaciones de la versión que se está viendo y, para el profesor, el
 * dictamen. Observar pide el texto de la observación (una observación vacía no le
 * sirve al grupo); aprobar es un clic.
 */
function PanelObservaciones({ entregaId, estado: estadoInicial, revisable, onCambio }) {
  const [notas, setNotas] = useState(null)
  const [estado, setEstado] = useState(estadoInicial)
  const [observando, setObservando] = useState(false)
  const [texto, setTexto] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  const recargar = useCallback(
    () =>
      listarObservaciones(entregaId)
        .then(setNotas)
        .catch((e) => setError(e.message)),
    [entregaId],
  )

  useEffect(() => {
    recargar()
  }, [recargar])

  async function enviarObservacion(e) {
    e.preventDefault()
    setError(null)
    setOcupado(true)
    try {
      await crearObservacion(entregaId, texto.trim())
      setTexto('')
      setObservando(false)
      setEstado('OBSERVADA')
      await recargar()
      onCambio?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setOcupado(false)
    }
  }

  async function aprobar() {
    setError(null)
    setOcupado(true)
    try {
      await cambiarEstadoEntrega(entregaId, 'APROBADA')
      setEstado('APROBADA')
      onCambio?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setOcupado(false)
    }
  }

  const pendientes = (notas ?? []).filter((n) => n.estado === 'PENDIENTE').length

  return (
    <aside className="visor__panel" aria-label="Observaciones de esta versión">
      <div className="visor__panel-cabecera">
        <h3>Observaciones del profesor</h3>
        {notas && (
          <span className={`cuenta-chip ${pendientes > 0 ? 'cuenta-chip--aviso' : ''}`}>
            {notas.length === 1 ? '1 nota' : `${notas.length} notas`}
          </span>
        )}
      </div>

      {notas === null ? (
        <p className="visor__vacio">Cargando…</p>
      ) : notas.length === 0 ? (
        <p className="visor__vacio">Esta versión todavía no tiene observaciones.</p>
      ) : (
        <ul className="visor__notas">
          {notas.map((n) => (
            <li key={n.id} className={`visor__nota ${n.estado === 'PENDIENTE' ? 'is-pendiente' : ''}`}>
              <div className="visor__nota-autor">
                <strong>{n.registradaPor?.name}</strong>
                <span>{fechaHora(n.createdAt)}</span>
              </div>
              <p>{n.descripcion}</p>
              <EstadoBadge estado={n.estado} tipo="observacion" />
            </li>
          ))}
        </ul>
      )}

      {revisable && (
        <div className="visor__dictamen">
          <p className="etiqueta-mayus">Dictamen de la entrega</p>
          {error && (
            <p className="alerta" role="alert">
              {error}
            </p>
          )}
          {estado && (
            <p className="visor__estado">
              Esta versión está: <EstadoBadge estado={estado} tipo="entrega" />
            </p>
          )}
          {observando ? (
            <form onSubmit={enviarObservacion}>
              <label className="sr-only" htmlFor={`obs-${entregaId}`}>
                Observación para el grupo
              </label>
              <textarea
                id={`obs-${entregaId}`}
                rows={4}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Qué tiene que corregir el grupo y por qué."
                autoFocus
                required
              />
              <div className="acciones-fila">
                <button type="submit" className="btn btn--observar" disabled={ocupado || !texto.trim()}>
                  {ocupado ? 'Enviando…' : 'Enviar observación'}
                </button>
                <button
                  type="button"
                  className="btn btn--sutil"
                  onClick={() => setObservando(false)}
                  disabled={ocupado}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="acciones-fila">
              <button
                type="button"
                className="btn btn--observar"
                onClick={() => setObservando(true)}
                disabled={ocupado}
              >
                Observar entrega
              </button>
              <button
                type="button"
                className="btn btn--aprobar"
                onClick={aprobar}
                disabled={ocupado || estado === 'APROBADA'}
              >
                {estado === 'APROBADA' ? '✓ Aprobada' : 'Aprobar entrega'}
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
