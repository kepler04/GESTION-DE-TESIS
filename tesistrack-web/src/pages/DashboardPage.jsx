import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarCarpetas, obtenerDashboard } from '../api/tesistrack'
import useProyectoActivo from '../hooks/useProyectoActivo'
import { useAuth } from '../auth/AuthContext'
import AccionPrincipal from '../components/AccionPrincipal'
import DashboardAsesor from '../components/DashboardAsesor'
import EstadoBadge from '../components/EstadoBadge'
import Icono from '../components/Icono'
import PrimerosPasos from '../components/PrimerosPasos'
import InvitacionesRecibidas from '../components/InvitacionesRecibidas'
import ProximasReuniones from '../components/ProximasReuniones'
import RegistrarTema from '../components/RegistrarTema'
import UnirseConCodigo from '../components/UnirseConCodigo'
import {
  Card,
  Cargando,
  ErrorMsg,
  PageHead,
  SelectorProyecto,
  SinProyecto,
  Vacio,
  fecha,
  nombres,
} from '../components/ui'
import { diasHasta, haceTiempo, plural } from '../utils/formato'

/**
 * El Dashboard cambia de forma según el rol, no solo de datos: el **profesor** ve un
 * panel agregado sobre todas sus clases; el **estudiante** (y el coordinador, que
 * mira cualquier tesis) ven el estado de **una** tesis: su semáforo, el hito que toca
 * ahora, las observaciones por corregir y las próximas reuniones.
 */
export default function DashboardPage() {
  const { user } = useAuth()
  return user?.role === 'ASESOR' ? <DashboardAsesor /> : <DashboardTesis />
}

function DashboardTesis() {
  const { user } = useAuth()
  const {
    proyectos,
    activoId,
    seleccionar,
    recargar: recargarProyectos,
    cargando: cargandoProyectos,
  } = useProyectoActivo()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [mostrarUnirse, setMostrarUnirse] = useState(false)
  const [recarga, setRecarga] = useState(0)
  const [registrando, setRegistrando] = useState(false)

  useEffect(() => {
    if (!activoId) return
    let cancelado = false
    setCargando(true)
    setError(null)
    obtenerDashboard(activoId)
      .then((resumen) => !cancelado && setData(resumen))
      .catch((e) => !cancelado && setError(e.message))
      .finally(() => !cancelado && setCargando(false))
    return () => {
      cancelado = true
    }
  }, [activoId, recarga])

  if (cargandoProyectos) return <Cargando />
  // El estudiante sin tesis no ve un panel vacío: ve cómo empezar.
  if (!activoId && user?.role === 'ESTUDIANTE') {
    return (
      <>
        <InvitacionesRecibidas onCambio={recargarProyectos} />
        <PrimerosPasos onListo={recargarProyectos} />
      </>
    )
  }
  if (!activoId) return <SinProyecto rol={user?.role} />

  const esEstudiante = user?.role === 'ESTUDIANTE'
  // Una tesis sin profesor no avanza: no hay quien cargue hitos ni revise entregas.
  // Es lo primero que el estudiante tiene que resolver, así que va arriba de todo.
  const huerfano = esEstudiante && data && !data.proyecto?.asesor

  return (
    <>
      <PageHead
        titulo={esEstudiante ? 'Inicio' : 'Dashboard'}
        descripcion={esEstudiante ? 'Qué te toca ahora y cómo va tu tesis.' : 'El estado de la tesis elegida.'}
      >
        <SelectorProyecto proyectos={proyectos} activoId={activoId} onChange={seleccionar} />
      </PageHead>

      {error && <ErrorMsg>{error}</ErrorMsg>}
      {cargando && !data && <Cargando />}

      {huerfano &&
        (mostrarUnirse ? (
          <UnirseConCodigo
            proyectoId={activoId}
            onCerrar={() => setMostrarUnirse(false)}
            onUnido={async () => {
              setMostrarUnirse(false)
              setRecarga((n) => n + 1)
            }}
          />
        ) : (
          <Card titulo="Tu tesis todavía no tiene profesor">
            <Vacio
              icono="persona"
              cta={
                <button
                  type="button"
                  className="btn btn--primario"
                  onClick={() => setMostrarUnirse(true)}
                >
                  Unirme con un código
                </button>
              }
            >
              Si tu profesor te pasó el código de su clase, pegalo acá y tu tesis se suma a la clase.
            </Vacio>
          </Card>
        ))}

      {esEstudiante && (
        <InvitacionesRecibidas
          onCambio={async () => {
            await recargarProyectos()
            setRecarga((n) => n + 1)
          }}
        />
      )}

      {data && (
        <>
          {esEstudiante && <AccionPrincipal data={data} onRegistrarTema={() => setRegistrando(true)} />}
          {esEstudiante && !data.proyecto.titulo && (
            <RecordatorioTema proyecto={data.proyecto} onRegistrar={() => setRegistrando(true)} />
          )}
          <PortadaTesis data={data} user={user} />
          <ProximoHito data={data} esEstudiante={esEstudiante} />

          <div className="dashboard-alumno">
            <div>
              <ObservacionesPorCorregir data={data} esEstudiante={esEstudiante} />

              <Card
                titulo="Tareas pendientes"
                accion={
                  <Link className="btn btn--fantasma btn--chico" to="/mi-tesis?pestana=tareas">
                    Ver todas
                  </Link>
                }
              >
                {data.tareasPendientes.length === 0 ? (
                  <Vacio icono="tareas">Sin tareas pendientes.</Vacio>
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
            </div>

            <div>
              <ProximasReuniones rol={user?.role} variante="tarjeta" />
              {data.proyecto.area && <MiClase area={data.proyecto.area} asesor={data.proyecto.asesor} />}
            </div>
          </div>
        </>
      )}

      {registrando && data && (
        <RegistrarTema
          proyecto={data.proyecto}
          onCerrar={() => setRegistrando(false)}
          onListo={async () => {
            setRegistrando(false)
            await recargarProyectos()
            setRecarga((n) => n + 1)
          }}
        />
      )}
    </>
  )
}

/**
 * El tema todavía por definir: un recordatorio, no una alarma (Decisión 29). Lleva a
 * los temas que propone el profesor, si los cargó en la carpeta Temas de tesis.
 */
function RecordatorioTema({ proyecto, onRegistrar }) {
  const [temas, setTemas] = useState(null)

  useEffect(() => {
    if (!proyecto.area) return
    let cancelado = false
    listarCarpetas(proyecto.area.id)
      .then((cs) => {
        const c = cs.find((x) => /tema/i.test(x.nombre) && x.materiales.length > 0)
        if (!cancelado && c) setTemas(c)
      })
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [proyecto.area])

  return (
    <section className="recordatorio-tema" aria-label="Tema por definir">
      <p>
        <strong>Tu tema está por definir.</strong> No hay apuro: cuando lo tengas, registralo y tu
        profesor lo ve.
      </p>
      <div className="acciones-fila">
        <button type="button" className="btn btn--sutil btn--chico" onClick={onRegistrar}>
          Registrar mi tema
        </button>
        {temas && (
          <Link className="btn btn--fantasma btn--chico" to={`/clases/${proyecto.area.id}?pestana=trabajo&carpeta=${temas.id}`}>
            Ver los temas que propone tu profesor ({temas.materiales.length})
          </Link>
        )}
      </div>
    </section>
  )
}

/**
 * La portada de la tesis: el semáforo del grupo (Decisión 26), el tema y quiénes
 * son. El semáforo que ve el estudiante es solo el de su propio grupo (Decisión 22).
 */
function PortadaTesis({ data, user }) {
  const { proyecto, semaforo } = data
  const otros = proyecto.estudiantes.filter((e) => e.id !== user?.id)
  const grupal = proyecto.estudiantes.length > 1
  return (
    <section className="tesis-portada" aria-label="Tu tesis">
      <div className="tesis-portada__etiquetas">
        {semaforo && (
          <span className="tesis-portada__semaforo">
            <span className="sr-only">Semáforo: </span>
            <EstadoBadge estado={semaforo} tipo="grupo" />
          </span>
        )}
        <span className="tag">{grupal ? `Grupo de ${proyecto.estudiantes.length}` : 'Individual'}</span>
      </div>
      <h2>
        {proyecto.titulo ? (
          proyecto.titulo
        ) : (
          <span className="tesis-portada__sin-tema">Tema por definir</span>
        )}
      </h2>
      <dl className="tesis-portada__datos">
        <div>
          <dt>Profesor</dt>
          <dd>
            {proyecto.asesor?.name ?? 'Todavía sin profesor'}
            {proyecto.asesor && user?.role === 'ESTUDIANTE' && (
              <Link className="tesis-portada__escribir" to={`/mensajes?con=${proyecto.asesor.id}`}>
                Escribirle
              </Link>
            )}
          </dd>
        </div>
        <div>
          <dt>{grupal ? (otros.length === 1 ? 'Compañero de grupo' : 'Compañeros de grupo') : 'Integrantes'}</dt>
          <dd>{grupal ? otros.map((e) => e.name).join(', ') || nombres(proyecto.estudiantes) : nombres(proyecto.estudiantes)}</dd>
        </div>
        <div>
          <dt>Clase</dt>
          <dd>
            {proyecto.area ? (
              <Link to={`/clases/${proyecto.area.id}`}>{proyecto.area.nombre} →</Link>
            ) : (
              'Sin clase'
            )}
          </dd>
        </div>
      </dl>
    </section>
  )
}

/**
 * El hito que toca ahora: el primero sin cerrar que vence antes (los que no tienen
 * fecha quedan detrás). Con la fecha límite bien a la vista y, para el estudiante,
 * el botón para entregar.
 */
function ProximoHito({ data, esEstudiante }) {
  const abiertos = data.proximosHitos
  if (abiertos.length === 0) {
    return (
      <section className="proximo-hito" aria-label="Próximo hito">
        <Vacio icono="hitos">No queda ningún hito abierto.</Vacio>
      </section>
    )
  }
  const conFecha = abiertos
    .filter((h) => h.fechaLimite)
    .sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite))
  const hito = conFecha[0] ?? abiertos[0]
  const dias = hito.fechaLimite ? diasHasta(hito.fechaLimite) : null
  const urgente = dias !== null && dias <= 3
  const enlaceEntregas = `/mi-tesis?pestana=entregas&hito=${hito.id}`

  return (
    <section className="proximo-hito" aria-labelledby="proximo-hito-titulo">
      <div className="proximo-hito__cabecera">
        <div>
          <div className="proximo-hito__etapa">
            <EstadoBadge estado={hito.estado} />
            <p className="etiqueta-mayus">Próximo hito</p>
          </div>
          <h2 id="proximo-hito-titulo">{hito.nombre}</h2>
        </div>
        {hito.fechaLimite && (
          <div className="proximo-hito__fecha">
            <p className="etiqueta-mayus">Fecha límite</p>
            <strong className={urgente ? 'is-urgente' : undefined}>{fecha(hito.fechaLimite)}</strong>
            <span>
              {dias < 0
                ? `Venció hace ${plural(-dias, 'día')}`
                : dias === 0
                  ? 'Vence hoy'
                  : dias === 1
                    ? 'Vence mañana'
                    : `Quedan ${dias} días`}
            </span>
          </div>
        )}
      </div>
      {hito.descripcion && <p className="proximo-hito__desc">{hito.descripcion}</p>}
      <div className="acciones-fila">
        {esEstudiante && hito.estado !== 'ENTREGADO' && (
          <Link className="btn btn--primario" to={enlaceEntregas}>
            <Icono nombre="entregas" />
            Subir entrega del hito
          </Link>
        )}
        <Link className="btn btn--sutil" to={enlaceEntregas}>
          <Icono nombre="tesis" />
          Ver entregas
        </Link>
        {data.proyecto.area && (
          <Link className="btn btn--fantasma" to={`/clases/${data.proyecto.area.id}?pestana=trabajo`}>
            Ver materiales de la clase
          </Link>
        )}
      </div>
    </section>
  )
}

/** Las observaciones sin resolver, con el hito al que pertenecen y cómo corregirlas. */
function ObservacionesPorCorregir({ data, esEstudiante }) {
  const lista = data.observacionesPendientes
  return (
    <Card
      titulo={
        <>
          <span className="card__titulo-icono">
            <Icono nombre="observaciones" />
          </span>
          Observaciones por corregir
        </>
      }
      accion={
        lista.length > 0 && (
          <span className="cuenta-chip cuenta-chip--aviso">
            {lista.length === 1 ? '1 pendiente' : `${lista.length} pendientes`}
          </span>
        )
      }
    >
      {lista.length === 0 ? (
        <Vacio icono="tareas">No hay observaciones pendientes.</Vacio>
      ) : (
        <ul className="filas">
          {lista.map((o) => (
            <li key={o.id} className="observacion-fila">
              <div className="observacion-fila__cabecera">
                <span>
                  <EstadoBadge estado={o.estado} tipo="observacion" />{' '}
                  <strong>{o.hitoNombre}</strong>
                </span>
                {esEstudiante && (
                  <Link
                    className="btn btn--sutil btn--chico"
                    to={`/mi-tesis?pestana=entregas&hito=${o.hitoId}&corregir=1`}
                  >
                    Subir versión corregida
                  </Link>
                )}
              </div>
              <p className="observacion-fila__texto">“{o.descripcion}”</p>
              <span className="lista__meta">
                Dejada por {o.registradaPor?.name} · {haceTiempo(o.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function MiClase({ area, asesor }) {
  return (
    <Card titulo="Mi clase">
      <div className="proximo">
        <strong className="proximo__titulo">{area.nombre}</strong>
        <span className="proximo__meta">Profesor: {asesor?.name}</span>
      </div>
      <div className="acciones-fila mi-clase__acciones">
        <Link className="btn btn--sutil btn--chico" to={`/clases/${area.id}`}>
          Ver tablón
        </Link>
        <Link className="btn btn--sutil btn--chico" to={`/clases/${area.id}?pestana=trabajo`}>
          Materiales
        </Link>
      </div>
    </Card>
  )
}
