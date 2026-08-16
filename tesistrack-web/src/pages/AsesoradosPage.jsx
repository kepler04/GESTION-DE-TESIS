import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarAsesorados } from '../api/tesistrack'
import EstadoBadge from '../components/EstadoBadge'
import { Card, Cargando, ErrorMsg, PageHead, Vacio } from '../components/ui'

/**
 * Panel del asesor: todos sus asesorados y qué necesita atención de cada uno.
 *
 * Responde la pregunta con la que abre la app —¿a quién le presto atención hoy?—
 * sin tener que entrar tesis por tesis. Por eso el backend ordena primero a los
 * que tienen pendientes, y las cifras son de cosas por hacer, no de logros.
 */
export default function AsesoradosPage() {
  const [asesorados, setAsesorados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    listarAsesorados()
      .then(setAsesorados)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [])

  const conPendientes = asesorados.filter(
    (a) => a.entregasPorRevisar + a.observacionesPendientes + a.tareasVencidas > 0,
  ).length

  if (cargando) return <Cargando />

  return (
    <>
      <PageHead
        titulo="Mis asesorados"
        descripcion={
          asesorados.length === 0
            ? 'Los estudiantes que estás acompañando.'
            : conPendientes === 0
              ? 'Todo al día: ningún asesorado espera algo tuyo.'
              : `${conPendientes} de ${asesorados.length} necesitan tu atención.`
        }
      />

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {asesorados.length === 0 ? (
        <Card>
          <Vacio
            cta={
              <Link className="btn btn--primario" to="/proyectos">
                Crear un área e invitar
              </Link>
            }
          >
            Todavía no tenés asesorados. Creá un área en Proyectos y pasales el código de invitación
            a tus estudiantes: al crear su tesis lo pegan y aparecen acá.
          </Vacio>
        </Card>
      ) : (
        <div className="asesorados">
          {asesorados.map((a) => {
            const pendientes =
              a.entregasPorRevisar + a.observacionesPendientes + a.tareasVencidas
            const progreso =
              a.hitosTotales === 0 ? 0 : Math.round((a.hitosCompletados / a.hitosTotales) * 100)

            return (
              <article
                key={a.proyectoId}
                className={`asesorado ${pendientes === 0 ? 'is-al-dia' : ''}`}
              >
                <header className="asesorado__cabecera">
                  <div>
                    <h2>{a.estudiante?.name}</h2>
                    <p className="asesorado__tesis">{a.titulo}</p>
                  </div>
                  {a.area && <span className="asesorado__area">{a.area.nombre}</span>}
                </header>

                <div className="asesorado__avance">
                  <div className="asesorado__barra" aria-hidden="true">
                    <span style={{ width: `${progreso}%` }} />
                  </div>
                  <span className="lista__meta">
                    {a.hitosCompletados} de {a.hitosTotales} hitos completados
                  </span>
                </div>

                {a.hitoActual ? (
                  <p className="asesorado__hito">
                    <span className="tenue">Va por:</span> <strong>{a.hitoActual.nombre}</strong>{' '}
                    <EstadoBadge estado={a.hitoActual.estado} />
                  </p>
                ) : (
                  <p className="asesorado__hito tenue">
                    {a.hitosTotales === 0
                      ? 'Sin hitos definidos todavía.'
                      : 'Todos los hitos completados.'}
                  </p>
                )}

                {pendientes === 0 ? (
                  <p className="asesorado__ok">✓ Nada pendiente de tu lado.</p>
                ) : (
                  <ul className="asesorado__pendientes">
                    {a.entregasPorRevisar > 0 && (
                      <li>
                        <Link to="/observaciones">
                          {a.entregasPorRevisar} {a.entregasPorRevisar === 1 ? 'hito' : 'hitos'} por
                          revisar
                        </Link>
                      </li>
                    )}
                    {a.observacionesPendientes > 0 && (
                      <li>
                        <Link to="/observaciones">
                          {a.observacionesPendientes}{' '}
                          {a.observacionesPendientes === 1 ? 'observación' : 'observaciones'} sin
                          resolver
                        </Link>
                      </li>
                    )}
                    {a.tareasVencidas > 0 && (
                      <li className="is-vencida">
                        <Link to="/tareas">
                          {a.tareasVencidas} {a.tareasVencidas === 1 ? 'tarea vencida' : 'tareas vencidas'}
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
