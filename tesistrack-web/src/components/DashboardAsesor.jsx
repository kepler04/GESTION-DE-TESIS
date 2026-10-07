import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarAreas, obtenerDashboardAsesor, rutaArchivoEntrega } from '../api/tesistrack'
import Icono from './Icono'
import PreguntaAsesoriasPrivadas from './PreguntaAsesoriasPrivadas'
import PrimerosPasosAsesor from './PrimerosPasosAsesor'
import ProximasReuniones from './ProximasReuniones'
import RepartoSemaforo from './RepartoSemaforo'
import VisorArchivo from './VisorArchivo'
import { Card, Cargando, ErrorMsg, PageHead, Seccion, Vacio } from './ui'
import { esPrevisualizable } from '../utils/archivos'
import { diasHasta, haceTiempo, plural } from '../utils/formato'

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
  // La entrega abierta en el visor desde "Para revisar"; null si ninguna.
  const [viendo, setViendo] = useState(null)

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
        descripcion="Cómo vienen tus clases, qué entregas esperan tu revisión y quién necesita atención."
      />

      <PreguntaAsesoriasPrivadas />

      {sinGrupos ? (
        <PrimerosPasosAsesor areas={areas} onCreada={recargar} />
      ) : (
        <>
          <ProximasReuniones rol="ASESOR" />

          <Seccion
            titulo="Mis clases"
            accion={
              <Link className="btn btn--fantasma" to="/clases">
                Ver todas las clases →
              </Link>
            }
          >
            {datos.clases.length === 0 ? (
              <Vacio
                icono="clases"
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
                  <article key={c.id} className="clase-mini clase-card">
                    <div className="clase-mini__cabecera">
                      <div>
                        <h3 className="clase-mini__nombre">
                          <Link to={`/clases/${c.id}`}>{c.nombre}</Link>
                        </h3>
                        <p className="clase-mini__codigo">
                          Código: <code>{c.codigo}</code>
                        </p>
                      </div>
                    </div>
                    <p className="clase-mini__cuenta">
                      {plural(c.alumnos, 'alumno')} · {plural(c.grupos, 'grupo')}
                    </p>
                    <RepartoSemaforo clase={c} />
                    <Link className="btn btn--sutil btn--chico" to={`/clases/${c.id}`}>
                      Abrir
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </Seccion>

          <div className="grid-2">
            <Card
              titulo={
                <>
                  <span className="card__titulo-icono">
                    <Icono nombre="tesis" />
                  </span>
                  Para revisar
                </>
              }
              accion={
                datos.paraRevisar.length > 0 && (
                  <span className="cuenta-chip cuenta-chip--violeta">
                    <Icono nombre="entregas" />
                    {plural(datos.paraRevisar.length, 'entrega', 'entregas')}
                  </span>
                )
              }
            >
              {datos.paraRevisar.length === 0 ? (
                <Vacio icono="tareas">No hay entregas esperando tu revisión.</Vacio>
              ) : (
                <ul className="filas">
                  {datos.paraRevisar.map((r) => (
                    <li key={r.entregaId} className="fila">
                      <div className="fila__cuerpo">
                        <strong className="fila__titulo">
                          {r.alumnos.join(', ')} · {r.hito} (v{r.version})
                        </strong>
                        <span className="fila__meta">
                          {r.clase ?? 'Asesoría privada'} · Esperando desde {haceTiempo(r.desde)}
                        </span>
                      </div>
                      <div className="fila__acciones">
                        {r.entrega?.tieneArchivo && esPrevisualizable(r.entrega.archivoTipo) && (
                          <button
                            type="button"
                            className="btn btn--sutil btn--chico"
                            onClick={() => setViendo(r)}
                          >
                            Ver entrega
                          </button>
                        )}
                        <Link
                          className="btn btn--primario btn--chico"
                          to={`/entregas?proyecto=${r.proyectoId}&hito=${r.hitoId}`}
                        >
                          Evaluar
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card
              titulo={
                <>
                  <span className="card__titulo-icono card__titulo-icono--alerta">
                    <Icono nombre="alerta" />
                  </span>
                  Necesitan atención
                </>
              }
              accion={
                datos.necesitanAtencion.length > 0 && (
                  <span className="cuenta-chip cuenta-chip--alerta">
                    {plural(datos.necesitanAtencion.length, 'grupo')}
                  </span>
                )
              }
            >
              {datos.necesitanAtencion.length === 0 ? (
                <Vacio icono="tareas">Ningún grupo atrasado, en riesgo ni sin tema. Todo viene bien.</Vacio>
              ) : (
                <ul className="filas">
                  {datos.necesitanAtencion.map((a) => (
                    <li key={a.proyectoId} className="fila">
                      <div className="fila__cuerpo">
                        <strong className="fila__titulo">
                          {a.alumnos.join(', ')} · {a.clase ?? 'Asesoría privada'}
                        </strong>
                        {motivos(a).map((m) => (
                          <span key={m.texto} className={`fila__motivo motivo--${m.tono}`}>
                            {m.icono} {m.texto}
                          </span>
                        ))}
                        <span className="fila__meta">Tema: {a.tesis ?? 'Tema por definir'}</span>
                      </div>
                      <div className="fila__acciones">
                        <Link
                          className="btn btn--sutil btn--chico"
                          to={
                            a.areaId
                              ? `/clases/${a.areaId}?pestana=${a.semaforo === 'ROJO' || a.semaforo === 'AMARILLO' ? 'seguimiento' : 'personas'}`
                              : '/asesorias-privadas'
                          }
                        >
                          Ver
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}

      {viendo && (
        <VisorArchivo
          titulo={`${viendo.entrega.archivoNombre ?? viendo.hito} · v${viendo.version}`}
          nombreArchivo={viendo.entrega.archivoNombre}
          tipo={viendo.entrega.archivoTipo}
          tamano={viendo.entrega.archivoTamano}
          detalle={`Entrega de ${viendo.alumnos.join(', ')}`}
          fecha={viendo.entrega.createdAt}
          ruta={rutaArchivoEntrega(viendo.entregaId)}
          entregaId={viendo.entregaId}
          estado={viendo.entrega.estado}
          revisable
          onCambio={recargar}
          onCerrar={() => setViendo(null)}
        />
      )}
    </>
  )
}

/**
 * Por qué un grupo necesita atención, en palabras y con números. El ícono acompaña
 * al texto (✕ atrasado, ⚠ en riesgo): el color solo nunca dice el motivo.
 */
function motivos(a) {
  const lista = []
  if (a.hitosEnFalta > 0) {
    lista.push({
      tono: 'rojo',
      icono: '✕',
      texto: `Atrasado: ${plural(a.hitosEnFalta, 'hito vencido', 'hitos vencidos')} sin entregar`,
    })
  }
  if (a.hitosObservados > 0) {
    lista.push({
      tono: 'amarillo',
      icono: '⚠',
      texto: `En riesgo: ${plural(a.hitosObservados, 'hito observado', 'hitos observados')} sin subsanar`,
    })
  }
  if (a.proximoHito) {
    lista.push({ tono: 'amarillo', icono: '⚠', texto: `En riesgo: ${a.proximoHito} ${vence(a.proximoVence)}` })
  }
  if (a.sinTema) {
    lista.push({ tono: 'gris', icono: '—', texto: 'Sin tema registrado todavía' })
  }
  return lista
}

function vence(fechaLimite) {
  const dias = diasHasta(fechaLimite)
  if (dias <= 0) return 'vence hoy, sin entrega'
  if (dias === 1) return 'vence mañana, sin entrega'
  return `vence en ${dias} días, sin entrega`
}
