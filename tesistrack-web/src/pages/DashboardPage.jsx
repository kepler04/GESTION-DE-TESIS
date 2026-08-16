import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerDashboard, listarHitos } from '../api/tesistrack'
import useProyectoActivo from '../hooks/useProyectoActivo'
import { useAuth } from '../auth/AuthContext'
import EstadoBadge from '../components/EstadoBadge'
import ProgressRing from '../components/ProgressRing'
import { Card, Cargando, ErrorMsg, PageHead, SelectorProyecto, SinProyecto, Vacio, fecha } from '../components/ui'

function Tile({ valor, etiqueta, detalle, tono = 'neutro' }) {
  return (
    <div className={`tile tile--${tono}`}>
      <span className="tile__valor">{valor}</span>
      <span className="tile__etiqueta">{etiqueta}</span>
      {detalle && <span className="tile__detalle">{detalle}</span>}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { proyectos, activoId, seleccionar, cargando: cargandoProyectos } = useProyectoActivo()
  const [data, setData] = useState(null)
  const [hitos, setHitos] = useState([])
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!activoId) return
    let cancelado = false
    setCargando(true)
    setError(null)
    Promise.all([obtenerDashboard(activoId), listarHitos(activoId)])
      .then(([resumen, listaHitos]) => {
        if (cancelado) return
        setData(resumen)
        setHitos(listaHitos)
      })
      .catch((e) => !cancelado && setError(e.message))
      .finally(() => !cancelado && setCargando(false))
    return () => {
      cancelado = true
    }
  }, [activoId])

  if (cargandoProyectos) return <Cargando />
  if (!activoId) return <SinProyecto esEstudiante={user?.role === 'ESTUDIANTE'} />

  const completados = hitos.filter((h) => h.estado === 'COMPLETADO').length

  return (
    <>
      <PageHead titulo="Dashboard" descripcion={data?.proyecto?.titulo}>
        <SelectorProyecto proyectos={proyectos} activoId={activoId} onChange={seleccionar} />
      </PageHead>

      {error && <ErrorMsg>{error}</ErrorMsg>}
      {cargando && <Cargando />}

      {data && (
        <>
          <Card titulo="Estado del proyecto" className="card--resumen">
            <div className="resumen">
              <ProgressRing valor={completados} total={hitos.length} etiqueta="hitos completados" />
              <div className="tiles">
                <Tile
                  valor={data.tareasPendientes.length}
                  etiqueta="Tareas pendientes"
                  tono={data.tareasPendientes.length > 0 ? 'aviso' : 'ok'}
                />
                <Tile
                  valor={data.observacionesPendientes.length}
                  etiqueta="Observaciones por corregir"
                  tono={data.observacionesPendientes.length > 0 ? 'alerta' : 'ok'}
                />
                <Tile
                  valor={data.ultimaEntrega ? `v${data.ultimaEntrega.version}` : '—'}
                  etiqueta="Última entrega"
                  detalle={data.ultimaEntrega?.archivoNombre}
                />
                <Tile
                  valor={data.ultimasAsesorias.length}
                  etiqueta="Asesorías registradas"
                  detalle={data.ultimasAsesorias[0] ? fecha(data.ultimasAsesorias[0].fecha) : null}
                />
              </div>
            </div>
          </Card>

          <div className="grid-2">
            <Card
              titulo="Próximos hitos"
              accion={
                <Link className="btn btn--sutil" to="/hitos">
                  Ver todos
                </Link>
              }
            >
              {data.proximosHitos.length === 0 ? (
                <Vacio>No queda ningún hito abierto.</Vacio>
              ) : (
                <ul className="lista">
                  {data.proximosHitos.map((h) => (
                    <li key={h.id}>
                      <div>
                        <strong>{h.nombre}</strong>
                        <span className="lista__meta">Vence {fecha(h.fechaLimite)}</span>
                      </div>
                      <EstadoBadge estado={h.estado} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card titulo="Tareas pendientes">
              {data.tareasPendientes.length === 0 ? (
                <Vacio>Sin tareas pendientes.</Vacio>
              ) : (
                <ul className="lista">
                  {data.tareasPendientes.map((t) => (
                    <li key={t.id}>
                      <div>
                        <strong>{t.descripcion}</strong>
                        <span className="lista__meta">
                          {t.responsable?.name ?? 'Sin responsable'} · vence {fecha(t.fechaLimite)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card titulo="Observaciones por corregir">
              {data.observacionesPendientes.length === 0 ? (
                <Vacio>No hay observaciones pendientes.</Vacio>
              ) : (
                <ul className="lista">
                  {data.observacionesPendientes.map((o) => (
                    <li key={o.id}>
                      <div>
                        <strong>{o.descripcion}</strong>
                        <span className="lista__meta">
                          {o.registradaPor?.name} · {fecha(o.createdAt)}
                        </span>
                      </div>
                      <EstadoBadge estado={o.estado} tipo="observacion" />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card titulo="Últimas asesorías">
              {data.ultimasAsesorias.length === 0 ? (
                <Vacio>Todavía no se registraron asesorías.</Vacio>
              ) : (
                <ul className="lista">
                  {data.ultimasAsesorias.map((a) => (
                    <li key={a.id}>
                      <div>
                        <strong>{a.tema}</strong>
                        <span className="lista__meta">
                          {fecha(a.fecha)} · {a.registradaPor?.name}
                        </span>
                      </div>
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
