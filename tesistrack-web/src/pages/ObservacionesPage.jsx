import { useCallback, useEffect, useState } from 'react'
import {
  cambiarEstadoObservacion,
  crearObservacion,
  listarEntregas,
  listarHitos,
  listarObservaciones,
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
 * Observaciones del asesor sobre cada versión entregada.
 *
 * Las observaciones cuelgan de una entrega concreta, no del hito (Decisión 6):
 * lo que se observó sobre la v1 sigue perteneciendo a la v1 aunque después venga
 * una v2. Por eso la pantalla no pide "elegí una entrega" con un tercer
 * desplegable, sino que lista las versiones del hito con sus observaciones
 * debajo — el ciclo corregir → reentregar se lee de arriba abajo.
 */
export default function ObservacionesPage() {
  const { user } = useAuth()
  const { proyectos, activoId, activo, seleccionar, cargando: cargandoProyectos } = useProyectoActivo()

  // Solo el asesor del proyecto observa y resuelve (verificarAsesorDelProyecto).
  const puedeObservar = user?.role === 'ASESOR' && activo?.asesor?.id === user?.id

  const [hitos, setHitos] = useState([])
  const [hitoId, setHitoId] = useState(null)
  /** [{ ...entrega, observaciones: [] }] de la más nueva a la más vieja. */
  const [versiones, setVersiones] = useState([])
  const [cargandoHitos, setCargandoHitos] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const [observando, setObservando] = useState(null) // id de la entrega con el form abierto
  const [descripcion, setDescripcion] = useState('')
  const [guardando, setGuardando] = useState(false)

  const hito = hitos.find((h) => h.id === hitoId) ?? null

  useEffect(() => {
    if (!activoId) return
    let cancelado = false
    setCargandoHitos(true)
    setError(null)
    listarHitos(activoId)
      .then((lista) => {
        if (cancelado) return
        setHitos(lista)
        // El hito que espera revisión primero: el entregado, si no el observado.
        const enJuego =
          lista.find((h) => h.estado === 'ENTREGADO') ??
          lista.find((h) => h.estado === 'OBSERVADO') ??
          lista[0]
        setHitoId(enJuego?.id ?? null)
      })
      .catch((e) => !cancelado && setError(e.message))
      .finally(() => !cancelado && setCargandoHitos(false))
    return () => {
      cancelado = true
    }
  }, [activoId])

  /** Trae las versiones del hito y, para cada una, sus observaciones. */
  const recargar = useCallback(
    async (id = hitoId) => {
      if (!id) {
        setVersiones([])
        return
      }
      setCargando(true)
      try {
        const entregas = await listarEntregas(id)
        const conObservaciones = await Promise.all(
          entregas.map(async (e) => ({
            ...e,
            observaciones: await listarObservaciones(e.id),
          })),
        )
        setVersiones(conObservaciones.reverse())
      } catch (e) {
        setError(e.message)
      } finally {
        setCargando(false)
      }
    },
    [hitoId],
  )

  useEffect(() => {
    recargar(hitoId)
    setObservando(null)
    setDescripcion('')
  }, [hitoId, recargar])

  /** Observar o resolver cambia el estado del hito en el backend. */
  function refrescarHitos() {
    listarHitos(activoId).then(setHitos).catch(() => {})
  }

  async function handleObservar(e, entregaId) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      await crearObservacion(entregaId, descripcion)
      setDescripcion('')
      setObservando(null)
      await recargar()
      refrescarHitos()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleEstado(observacionId, estado) {
    setError(null)
    try {
      await cambiarEstadoObservacion(observacionId, estado)
      await recargar()
      refrescarHitos()
    } catch (err) {
      setError(err.message)
    }
  }

  if (cargandoProyectos) return <Cargando />
  if (!activoId) return <SinProyecto rol={user?.role} />

  const pendientes = versiones.reduce(
    (total, v) => total + v.observaciones.filter((o) => o.estado === 'PENDIENTE').length,
    0,
  )

  return (
    <>
      <PageHead
        titulo="Observaciones"
        descripcion="Lo que el asesor marcó sobre cada versión entregada."
      >
        <SelectorProyecto proyectos={proyectos} activoId={activoId} onChange={seleccionar} />
      </PageHead>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {cargandoHitos ? (
        <Cargando />
      ) : hitos.length === 0 ? (
        <Card>
          <Vacio>Este proyecto todavía no tiene hitos, así que no hay nada que observar.</Vacio>
        </Card>
      ) : (
        <>
          <Card titulo="Hito">
            <div className="selector-hito">
              <label>
                <span className="selector-hito__label">Observaciones del hito</span>
                <select value={hitoId ?? ''} onChange={(e) => setHitoId(Number(e.target.value))}>
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
              {versiones.length > 0 && (
                <p className="selector-hito__resumen">
                  {/* En plural la tilde se pierde: observación → observaciones. */}
                  {pendientes === 0
                    ? 'Sin observaciones pendientes.'
                    : `${pendientes} ${pendientes === 1 ? 'observación' : 'observaciones'} sin resolver.`}
                </p>
              )}
            </div>
          </Card>

          <Card titulo={versiones.length === 0 ? 'Sin entregas' : 'Versiones y sus observaciones'}>
            {cargando ? (
              <Cargando />
            ) : versiones.length === 0 ? (
              <Vacio>
                {puedeObservar
                  ? 'El estudiante todavía no subió ninguna versión de este hito. Las observaciones se registran sobre una entrega.'
                  : 'Todavía no hay versiones entregadas de este hito.'}
              </Vacio>
            ) : (
              <ol className="revisiones">
                {versiones.map((v, i) => (
                  <li key={v.id} className="revisiones__item">
                    <div className="revisiones__cabecera">
                      <span className="versiones__num">v{v.version}</span>
                      <div className="revisiones__archivo">
                        <strong>{v.archivoNombre}</strong>
                        <span className="lista__meta">
                          {v.entregadaPor?.name} · {fechaHora(v.createdAt)}
                        </span>
                      </div>
                      {puedeObservar && (
                        <button
                          type="button"
                          className="btn btn--sutil"
                          onClick={() => {
                            setObservando(observando === v.id ? null : v.id)
                            setDescripcion('')
                          }}
                        >
                          {observando === v.id ? 'Cancelar' : 'Observar'}
                        </button>
                      )}
                    </div>

                    {observando === v.id && (
                      <form className="revisiones__form" onSubmit={(e) => handleObservar(e, v.id)}>
                        <label>
                          Qué hay que corregir
                          <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            rows={3}
                            placeholder="Sé concreto: el estudiante corrige a partir de esto."
                            required
                            autoFocus
                          />
                        </label>
                        <p className="lista__meta">
                          Al registrarla, el hito vuelve a <strong>Observado</strong>.
                        </p>
                        <div className="form__acciones">
                          <button type="submit" className="btn btn--primario" disabled={guardando}>
                            {guardando ? 'Registrando…' : 'Registrar observación'}
                          </button>
                        </div>
                      </form>
                    )}

                    {v.observaciones.length === 0 ? (
                      <p className="revisiones__vacio">
                        {i === 0
                          ? 'Esta versión todavía no tiene observaciones.'
                          : 'No se observó nada sobre esta versión.'}
                      </p>
                    ) : (
                      <ul className="observaciones">
                        {v.observaciones.map((o) => (
                          <li
                            key={o.id}
                            className={`observaciones__item ${
                              o.estado === 'RESUELTA' ? 'is-resuelta' : ''
                            }`}
                          >
                            <div className="observaciones__texto">
                              <p>{o.descripcion}</p>
                              <span className="lista__meta">
                                {o.registradaPor?.name} · {fechaHora(o.createdAt)}
                              </span>
                            </div>
                            <div className="observaciones__estado">
                              <EstadoBadge estado={o.estado} tipo="observacion" />
                              {puedeObservar && (
                                <button
                                  type="button"
                                  className="btn btn--sutil"
                                  onClick={() =>
                                    handleEstado(
                                      o.id,
                                      o.estado === 'PENDIENTE' ? 'RESUELTA' : 'PENDIENTE',
                                    )
                                  }
                                >
                                  {o.estado === 'PENDIENTE' ? 'Marcar resuelta' : 'Reabrir'}
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
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
