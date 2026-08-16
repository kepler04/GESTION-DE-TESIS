import { useEffect, useState } from 'react'
import {
  cambiarEstadoEntrega,
  crearEntrega,
  descargarArchivoEntrega,
  listarEntregas,
  listarHitos,
  subirArchivoEntrega,
} from '../api/tesistrack'
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

  // Solo los estudiantes del proyecto suben entregas (verificarEstudianteDelProyecto).
  // La tesis puede ser grupal: cualquiera del grupo entrega. El asesor y el
  // coordinador leen, pero no entregan.
  const puedeEntregar =
    user?.role === 'ESTUDIANTE' && (activo?.estudiantes ?? []).some((e) => e.id === user?.id)
  const esAsesor = user?.role === 'ASESOR'

  const [hitos, setHitos] = useState([])
  const [hitoId, setHitoId] = useState(null)
  const [entregas, setEntregas] = useState([])
  const [cargandoHitos, setCargandoHitos] = useState(false)
  const [cargandoEntregas, setCargandoEntregas] = useState(false)
  const [error, setError] = useState(null)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [archivo, setArchivo] = useState(null)
  const [archivoUrl, setArchivoUrl] = useState('')
  const [comentario, setComentario] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [bajando, setBajando] = useState(null)

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
      // Dos pasos: primero la versión, después el binario. El alta es JSON y la
      // subida multipart, así que mezclarlas obligaría a armar el JSON como Blob.
      const entrega = await crearEntrega(hitoId, {
        archivoNombre: archivo?.name ?? null,
        archivoUrl: archivoUrl || null,
        comentario: comentario || null,
      })
      if (archivo) {
        await subirArchivoEntrega(entrega.id, archivo)
      }
      setArchivo(null)
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

  async function handleDescargar(entrega) {
    setError(null)
    setBajando(entrega.id)
    try {
      await descargarArchivoEntrega(entrega.id, entrega.archivoNombre)
    } catch (err) {
      setError(err.message)
    } finally {
      setBajando(null)
    }
  }

  async function handleEstado(entregaId, estado) {
    setError(null)
    try {
      await cambiarEstadoEntrega(entregaId, estado)
      recargarEntregas()
    } catch (err) {
      setError(err.message)
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
                <label>
                  Documento
                  <input
                    type="file"
                    onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                    accept=".pdf,.doc,.docx,.odt,.zip"
                  />
                </label>
                {archivo && (
                  <p className="lista__meta">
                    {archivo.name} · {(archivo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
                <p className="tenue">Hasta 15 MB. Queda guardado en la plataforma.</p>
                <label>
                  Enlace al archivo <span className="tenue">(opcional, si trabajás en Drive)</span>
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
                  <button
                    type="submit"
                    className="btn btn--primario"
                    // Sin documento ni enlace no hay nada que entregar.
                    disabled={guardando || (!archivo && !archivoUrl.trim())}
                  >
                    {guardando ? 'Subiendo…' : 'Registrar entrega'}
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
                      <div className="versiones__titulo">
                        <strong>{e.archivoNombre ?? 'Sin documento'}</strong>
                        <EstadoBadge estado={e.estado} tipo="entrega" />
                      </div>
                      {e.comentario && <p className="versiones__comentario">{e.comentario}</p>}
                      <span className="lista__meta">
                        {e.entregadaPor?.name} · {fechaHora(e.createdAt)}
                        {e.archivoTamano != null &&
                          ` · ${(e.archivoTamano / 1024 / 1024).toFixed(2)} MB`}
                      </span>

                      <div className="versiones__acciones">
                        {e.tieneArchivo && (
                          <button
                            type="button"
                            className="btn btn--sutil"
                            onClick={() => handleDescargar(e)}
                            disabled={bajando === e.id}
                          >
                            {bajando === e.id ? 'Descargando…' : '↓ Descargar'}
                          </button>
                        )}
                        {e.archivoUrl && (
                          <a
                            className="versiones__enlace"
                            href={e.archivoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Abrir enlace ↗
                          </a>
                        )}
                        {/* El veredicto del asesor sobre esta versión concreta. */}
                        {esAsesor && e.estado !== 'APROBADA' && (
                          <button
                            type="button"
                            className="btn btn--sutil"
                            onClick={() => handleEstado(e.id, 'APROBADA')}
                          >
                            Aprobar versión
                          </button>
                        )}
                        {esAsesor && e.estado === 'APROBADA' && (
                          <button
                            type="button"
                            className="btn btn--sutil"
                            onClick={() => handleEstado(e.id, 'EN_REVISION')}
                          >
                            Reabrir
                          </button>
                        )}
                      </div>
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
