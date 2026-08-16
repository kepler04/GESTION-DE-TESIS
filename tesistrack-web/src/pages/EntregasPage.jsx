import { useEffect, useState } from 'react'
import { crearEntrega, listarEntregas, listarHitos } from '../api/tesistrack'
import useProyectoActivo from '../hooks/useProyectoActivo'
import { useAuth } from '../auth/AuthContext'
import EstadoBadge from '../components/EstadoBadge'
import {
  Card,
  Cargando,
  ErrorMsg,
  PageHead,
  SelectorProyecto,
  SinProyecto,
  Vacio,
  fechaHora,
} from '../components/ui'

/**
 * Entregas de un hito. Cada entrega es una versión nueva del mismo hito
 * (Decisión 5): v1, v2, v3… El número lo calcula el backend, no se envía.
 *
 * Las entregas cuelgan de un hito, no del proyecto, así que la pantalla pide
 * primero qué hito mirar. Se preselecciona el que está en juego —el observado
 * o el que ya se entregó— porque es el que el estudiante viene a atender.
 */
export default function EntregasPage() {
  const { user } = useAuth()
  const { proyectos, activoId, activo, seleccionar, cargando: cargandoProyectos } = useProyectoActivo()

  // Solo el estudiante del proyecto sube entregas (verificarEstudianteDelProyecto).
  // El asesor y el coordinador leen, pero no entregan.
  const puedeEntregar = user?.role === 'ESTUDIANTE' && activo?.estudiante?.id === user?.id

  const [hitos, setHitos] = useState([])
  const [hitoId, setHitoId] = useState(null)
  const [entregas, setEntregas] = useState([])
  const [cargandoHitos, setCargandoHitos] = useState(false)
  const [cargandoEntregas, setCargandoEntregas] = useState(false)
  const [error, setError] = useState(null)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [archivoNombre, setArchivoNombre] = useState('')
  const [archivoUrl, setArchivoUrl] = useState('')
  const [comentario, setComentario] = useState('')
  const [guardando, setGuardando] = useState(false)

  const hito = hitos.find((h) => h.id === hitoId) ?? null

  // Hitos del proyecto activo. Al cambiar de proyecto se elige uno nuevo.
  useEffect(() => {
    if (!activoId) return
    let cancelado = false
    setCargandoHitos(true)
    setError(null)
    listarHitos(activoId)
      .then((lista) => {
        if (cancelado) return
        setHitos(lista)
        // El hito "en juego" es el que espera acción: primero el observado (hay
        // que corregir), después el entregado, después el que está en proceso.
        const enJuego =
          lista.find((h) => h.estado === 'OBSERVADO') ??
          lista.find((h) => h.estado === 'ENTREGADO') ??
          lista.find((h) => h.estado === 'EN_PROCESO') ??
          lista[0]
        setHitoId(enJuego?.id ?? null)
      })
      .catch((e) => !cancelado && setError(e.message))
      .finally(() => !cancelado && setCargandoHitos(false))
    return () => {
      cancelado = true
    }
  }, [activoId])

  function recargarEntregas(id = hitoId) {
    if (!id) {
      setEntregas([])
      return
    }
    setCargandoEntregas(true)
    listarEntregas(id)
      .then(setEntregas)
      .catch((e) => setError(e.message))
      .finally(() => setCargandoEntregas(false))
  }

  useEffect(() => {
    recargarEntregas(hitoId)
    setMostrarForm(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hitoId])

  function cambiarHito(id) {
    setError(null)
    setHitoId(id)
  }

  async function handleCrear(e) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      await crearEntrega(hitoId, {
        archivoNombre,
        archivoUrl: archivoUrl || null,
        comentario: comentario || null,
      })
      setArchivoNombre('')
      setArchivoUrl('')
      setComentario('')
      setMostrarForm(false)
      recargarEntregas()
      // Entregar mueve el hito a ENTREGADO en el backend; recargamos los hitos
      // para que el badge de acá no quede mostrando el estado viejo.
      listarHitos(activoId).then(setHitos).catch(() => {})
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  if (cargandoProyectos) return <Cargando />
  if (!activoId) return <SinProyecto rol={user?.role} />

  // El backend las devuelve de v1 en adelante; se muestran al revés porque la
  // última versión es la que importa.
  const versiones = [...entregas].reverse()
  const ultimaVersion = entregas.length > 0 ? entregas[entregas.length - 1].version : null

  return (
    <>
      <PageHead
        titulo="Entregas"
        descripcion="Las versiones que se subieron contra cada hito."
      >
        <SelectorProyecto proyectos={proyectos} activoId={activoId} onChange={seleccionar} />
        {puedeEntregar && hito && (
          <button type="button" className="btn btn--primario" onClick={() => setMostrarForm(true)}>
            Subir nueva versión
          </button>
        )}
      </PageHead>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {cargandoHitos ? (
        <Cargando />
      ) : hitos.length === 0 ? (
        <Card>
          <Vacio>
            Este proyecto todavía no tiene hitos, así que no hay contra qué entregar. Los define el
            asesor del proyecto.
          </Vacio>
        </Card>
      ) : (
        <>
          <Card titulo="Hito">
            <div className="selector-hito">
              <label>
                <span className="selector-hito__label">Entregas del hito</span>
                <select
                  value={hitoId ?? ''}
                  onChange={(e) => cambiarHito(Number(e.target.value))}
                >
                  {hitos.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.orden}. {h.nombre}
                    </option>
                  ))}
                </select>
              </label>
              {hito && (
                <div className="selector-hito__estado">
                  <EstadoBadge estado={hito.estado} />
                </div>
              )}
            </div>
          </Card>

          {mostrarForm && (
            <Card titulo={`Nueva versión${ultimaVersion ? ` — sería la v${ultimaVersion + 1}` : ''}`}>
              <form className="form" onSubmit={handleCrear}>
                <p className="nota-subida">
                  La subida real de archivos todavía no está definida (falta decidir S3 o
                  filesystem). Por ahora se registra el nombre del archivo y, si lo tenés, el enlace
                  donde está.
                </p>
                <label>
                  Nombre del archivo
                  <input
                    value={archivoNombre}
                    onChange={(e) => setArchivoNombre(e.target.value)}
                    placeholder="Marco_teorico_v2.pdf"
                    required
                  />
                </label>
                <label>
                  Enlace al archivo <span className="tenue">(opcional)</span>
                  <input
                    type="url"
                    value={archivoUrl}
                    onChange={(e) => setArchivoUrl(e.target.value)}
                    placeholder="https://drive.google.com/…"
                  />
                </label>
                <label>
                  Comentario <span className="tenue">(opcional)</span>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={3}
                    placeholder="Qué cambió respecto de la versión anterior"
                  />
                </label>
                <p className="lista__meta">
                  Al registrarla, el hito queda <strong>Entregado</strong>, esperando revisión del
                  asesor.
                </p>
                <div className="form__acciones">
                  <button type="submit" className="btn btn--primario" disabled={guardando}>
                    {guardando ? 'Registrando…' : 'Registrar entrega'}
                  </button>
                  <button
                    type="button"
                    className="btn btn--sutil"
                    onClick={() => setMostrarForm(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </Card>
          )}

          <Card
            titulo={
              entregas.length === 0
                ? 'Sin entregas'
                : `${entregas.length} versi${entregas.length === 1 ? 'ón' : 'ones'}`
            }
          >
            {cargandoEntregas ? (
              <Cargando />
            ) : entregas.length === 0 ? (
              <Vacio>
                {puedeEntregar
                  ? 'Todavía no subiste ninguna versión de este hito. La primera será la v1.'
                  : 'El estudiante todavía no subió ninguna versión de este hito.'}
              </Vacio>
            ) : (
              <ol className="versiones">
                {versiones.map((e) => (
                  <li key={e.id} className="versiones__item">
                    <div className="versiones__marca">
                      <span className="versiones__num">v{e.version}</span>
                      {e.version === ultimaVersion && (
                        <span className="versiones__actual">actual</span>
                      )}
                    </div>
                    <div className="versiones__cuerpo">
                      <strong>{e.archivoNombre}</strong>
                      {e.comentario && <p className="versiones__comentario">{e.comentario}</p>}
                      <span className="lista__meta">
                        {e.entregadaPor?.name} · {fechaHora(e.createdAt)}
                      </span>
                      {e.archivoUrl && (
                        <a
                          className="versiones__enlace"
                          href={e.archivoUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir archivo ↗
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </>
      )}
    </>
  )
}
