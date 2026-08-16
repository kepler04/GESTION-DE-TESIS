import { useCallback, useEffect, useState } from 'react'
import { completarTarea, crearTarea, listarAsesorias, listarAcuerdos, listarTareas, obtenerProyecto } from '../api/tesistrack'
import useProyectoActivo from '../hooks/useProyectoActivo'
import { useAuth } from '../auth/AuthContext'
import { Card, Cargando, ErrorMsg, PageHead, SelectorProyecto, SinProyecto, Vacio, fecha } from '../components/ui'

/**
 * Tareas del proyecto: lo que quedó por hacer, con responsable y fecha.
 *
 * Cierra la cadena `Asesoría → Acuerdo → Tarea`, así que el alta deja elegir el
 * acuerdo del que sale. Es opcional —también hay tareas sueltas— pero cuando viene
 * de un acuerdo, la trazabilidad queda completa.
 */
export default function TareasPage() {
  const { user } = useAuth()
  const esAsesor = user?.role === 'ASESOR'
  const { proyectos, activoId, seleccionar, cargando: cargandoProyectos } = useProyectoActivo()

  const [tareas, setTareas] = useState([])
  const [acuerdos, setAcuerdos] = useState([])
  const [proyecto, setProyecto] = useState(null)
  const [soloPendientes, setSoloPendientes] = useState(true)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [descripcion, setDescripcion] = useState('')
  const [responsableId, setResponsableId] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [acuerdoId, setAcuerdoId] = useState('')
  const [guardando, setGuardando] = useState(false)

  const recargar = useCallback(() => {
    if (!activoId) return Promise.resolve()
    setCargando(true)
    return listarTareas(activoId, soloPendientes ? false : undefined)
      .then(setTareas)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [activoId, soloPendientes])

  useEffect(() => {
    recargar()
  }, [recargar])

  // Para el alta: a quién asignarla y de qué acuerdo puede salir.
  useEffect(() => {
    if (!activoId || !esAsesor) return
    obtenerProyecto(activoId).then(setProyecto).catch(() => {})
    listarAsesorias(activoId)
      .then(async (lista) => {
        const pares = await Promise.all(
          lista.map(async (a) => (await listarAcuerdos(a.id).catch(() => [])).map((ac) => ({ ...ac, tema: a.tema }))),
        )
        setAcuerdos(pares.flat())
      })
      .catch(() => {})
  }, [activoId, esAsesor])

  async function handleCrear(e) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      await crearTarea(activoId, {
        descripcion,
        responsableId: responsableId ? Number(responsableId) : null,
        fechaLimite: fechaLimite || null,
        acuerdoId: acuerdoId ? Number(acuerdoId) : null,
      })
      setDescripcion('')
      setResponsableId('')
      setFechaLimite('')
      setAcuerdoId('')
      setMostrarForm(false)
      await recargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleCompletar(id) {
    setError(null)
    try {
      await completarTarea(id)
      await recargar()
    } catch (err) {
      setError(err.message)
    }
  }

  if (cargandoProyectos) return <Cargando />
  if (!activoId) return <SinProyecto rol={user?.role} />

  const hoy = new Date().toISOString().slice(0, 10)
  const vencidas = tareas.filter((t) => !t.completada && t.fechaLimite && t.fechaLimite < hoy).length
  // Solo el asesor y el estudiante del proyecto pueden ser responsables.
  const candidatos = [proyecto?.estudiante, proyecto?.asesor].filter(Boolean)

  return (
    <>
      <PageHead
        titulo="Tareas"
        descripcion={
          vencidas > 0
            ? `${vencidas} ${vencidas === 1 ? 'tarea vencida' : 'tareas vencidas'}.`
            : 'Lo que quedó por hacer, con responsable y fecha límite.'
        }
      >
        <SelectorProyecto proyectos={proyectos} activoId={activoId} onChange={seleccionar} />
        {esAsesor && (
          <button
            type="button"
            className="btn btn--primario"
            onClick={() => setMostrarForm((v) => !v)}
          >
            {mostrarForm ? 'Cancelar' : 'Nueva tarea'}
          </button>
        )}
      </PageHead>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {mostrarForm && esAsesor && (
        <Card titulo="Nueva tarea">
          <form className="form" onSubmit={handleCrear}>
            <label>
              Descripción
              <input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Rehacer la matriz de consistencia"
                autoFocus
                required
              />
            </label>
            <label>
              Responsable <span className="tenue">(opcional)</span>
              <select value={responsableId} onChange={(e) => setResponsableId(e.target.value)}>
                <option value="">Sin asignar</option>
                {candidatos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fecha límite <span className="tenue">(opcional)</span>
              <input
                type="date"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
              />
            </label>
            {acuerdos.length > 0 && (
              <label>
                Sale del acuerdo <span className="tenue">(opcional)</span>
                <select value={acuerdoId} onChange={(e) => setAcuerdoId(e.target.value)}>
                  <option value="">Tarea suelta</option>
                  {acuerdos.map((ac) => (
                    <option key={ac.id} value={ac.id}>
                      {ac.tema}: {ac.descripcion}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="form__acciones">
              <button type="submit" className="btn btn--primario" disabled={guardando}>
                {guardando ? 'Creando…' : 'Crear tarea'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <label className="filtro-area">
          <span>Ver</span>
          <select
            value={soloPendientes ? 'pendientes' : 'todas'}
            onChange={(e) => setSoloPendientes(e.target.value === 'pendientes')}
          >
            <option value="pendientes">Solo pendientes</option>
            <option value="todas">Todas</option>
          </select>
        </label>
      </Card>

      {cargando ? (
        <Cargando />
      ) : tareas.length === 0 ? (
        <Card>
          <Vacio>
            {soloPendientes
              ? 'No queda ninguna tarea pendiente.'
              : 'Todavía no hay tareas en este proyecto.'}
          </Vacio>
        </Card>
      ) : (
        <Card titulo={`${tareas.length} ${tareas.length === 1 ? 'tarea' : 'tareas'}`}>
          <ul className="lista">
            {tareas.map((t) => {
              const vencida = !t.completada && t.fechaLimite && t.fechaLimite < hoy
              // La puede completar el responsable o el asesor del proyecto.
              const puedeCompletar =
                !t.completada && (esAsesor || t.responsable?.id === user?.id)
              return (
                <li key={t.id} className={vencida ? 'is-vencida' : ''}>
                  <div>
                    <strong className={t.completada ? 'tarea--hecha' : ''}>{t.descripcion}</strong>
                    <span className="lista__meta">
                      {t.responsable?.name ?? 'Sin responsable'}
                      {t.fechaLimite && ` · vence ${fecha(t.fechaLimite)}`}
                      {vencida && ' · vencida'}
                      {t.acuerdoId && ' · de un acuerdo'}
                    </span>
                  </div>
                  {t.completada ? (
                    <span className="badge badge--completado">
                      <span className="badge__icono" aria-hidden="true">
                        ✓
                      </span>
                      Completada
                    </span>
                  ) : puedeCompletar ? (
                    <button
                      type="button"
                      className="btn btn--sutil"
                      onClick={() => handleCompletar(t.id)}
                    >
                      Marcar completada
                    </button>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </>
  )
}
