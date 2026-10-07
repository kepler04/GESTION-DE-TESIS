import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarAreas, obtenerDashboardAsesor } from '../api/tesistrack'
import EstadoBadge from './EstadoBadge'
import PreguntaAsesoriasPrivadas from './PreguntaAsesoriasPrivadas'
import PrimerosPasosAsesor from './PrimerosPasosAsesor'
import ProximasReuniones from './ProximasReuniones'
import { Card, Cargando, ErrorMsg, PageHead, Vacio } from './ui'
import { haceTiempo, plural } from '../utils/formato'

/**
 * El Dashboard del profesor: un panel **agregado** sobre todas sus clases.
 *
 * Antes mostraba "Estado del proyecto" de **una** tesis —la de un alumno—, que es la
 * vista de un estudiante. Un profesor no se pregunta cómo va una tesis sino cómo
 * viene cada clase, qué le toca revisar y quién necesita atención, que es lo que
 * responde esto, con datos solo de sus propias clases (lo garantiza el backend).
 */
export default function DashboardAsesor() {
  const [datos, setDatos] = useState(null)
  const [areas, setAreas] = useState(null)
  const [error, setError] = useState(null)

  const recargar = useCallback(
    () =>
      Promise.all([obtenerDashboardAsesor(), listarAreas()])
        .then(([resumen, lista]) => {
          setDatos(resumen)
          setAreas(lista)
        })
        .catch((e) => setError(e.message)),
    [],
  )

  useEffect(() => {
    recargar()
  }, [recargar])

  if (error) return <ErrorMsg>{error}</ErrorMsg>
  if (!datos || !areas) return <Cargando />

  // Sin ningún grupo todavía: lo que hace falta es crear la clase y repartir el
  // código (Decisión 14), no un panel vacío.
  const sinGrupos = datos.clases.every((c) => c.grupos === 0) && datos.paraRevisar.length === 0

  return (
    <>
      <PageHead
        titulo="Dashboard"
        descripcion="Cómo vienen tus clases y qué te toca mirar hoy."
      />

      <PreguntaAsesoriasPrivadas />

      {sinGrupos ? (
        <PrimerosPasosAsesor areas={areas} onCreada={recargar} />
      ) : (
        <>
          <ProximasReuniones rol="ASESOR" />

          <Card
            titulo="Mis clases"
            accion={
              <Link className="btn btn--sutil" to="/clases">
                Ver todas
              </Link>
            }
          >
            {datos.clases.length === 0 ? (
              <Vacio
                cta={
                  <Link className="btn btn--primario" to="/clases">
                    Crear una clase
                  </Link>
                }
              >
                Todavía no tenés clases.
              </Vacio>
            ) : (
              <div className="clases">
                {datos.clases.map((c) => (
                  <article key={c.id} className="clase-card">
                    <h3 className="clase-card__nombre">{c.nombre}</h3>
                    <p className="clase-card__cuenta">
                      {plural(c.alumnos, 'alumno')} · {plural(c.grupos, 'grupo')}
                    </p>
                    <ul className="semaforo-resumen" aria-label="Cómo vienen los grupos">
                      <li className="semaforo-chip semaforo-chip--verde">
                        <strong>{c.verde}</strong> al día
                      </li>
                      <li className="semaforo-chip semaforo-chip--amarillo">
                        <strong>{c.amarillo}</strong> por atender
                      </li>
                      <li className="semaforo-chip semaforo-chip--rojo">
                        <strong>{c.rojo}</strong> atrasados
                      </li>
                    </ul>
                    <Link className="btn btn--primario" to={`/clases/${c.id}`}>
                      Abrir
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </Card>

          <div className="grid-2">
            <Card titulo="Para revisar">
              {datos.paraRevisar.length === 0 ? (
                <Vacio>No hay entregas esperando tu revisión.</Vacio>
              ) : (
                <ul className="lista">
                  {datos.paraRevisar.map((r) => (
                    <li key={r.entregaId}>
                      <div>
                        <strong>
                          {r.hito} · v{r.version}
                        </strong>
                        <span className="lista__meta">
                          {r.alumnos.join(', ')} · {r.clase ?? 'Asesoría privada'}
                        </span>
                        <span className="lista__meta">Esperando desde {haceTiempo(r.desde)}</span>
                      </div>
                      <Link
                        className="btn btn--sutil"
                        to={`/entregas?proyecto=${r.proyectoId}&hito=${r.hitoId}`}
                      >
                        Revisar
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card titulo="Necesitan atención">
              {datos.necesitanAtencion.length === 0 ? (
                <Vacio>Ningún grupo atrasado ni sin tema. Todo viene bien.</Vacio>
              ) : (
                <ul className="lista">
                  {datos.necesitanAtencion.map((a) => (
                    <li key={a.proyectoId}>
                      <div>
                        <strong>{a.alumnos.join(', ')}</strong>
                        <span className="lista__meta">
                          {a.tesis ?? 'Tema por definir'} · {a.clase ?? 'Asesoría privada'}
                        </span>
                        <span className="acciones-fila">
                          {a.semaforo === 'ROJO' && <EstadoBadge estado="ROJO" tipo="grupo" />}
                          {a.hitosEnFalta > 0 && (
                            <span className="lista__meta">
                              {plural(a.hitosEnFalta, 'hito vencido', 'hitos vencidos')}
                            </span>
                          )}
                          {a.sinTema && <span className="tag">Sin tema</span>}
                        </span>
                      </div>
                      <Link
                        className="btn btn--sutil"
                        to={
                          a.areaId
                            ? `/clases/${a.areaId}?pestana=${a.semaforo === 'ROJO' ? 'seguimiento' : 'personas'}`
                            : '/asesorias-privadas'
                        }
                      >
                        Ver
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  )
}
