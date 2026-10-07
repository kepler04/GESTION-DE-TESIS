import { useCallback, useEffect, useState } from 'react'
import {
  actualizarAsesoria,
  cambiarEstadoAsesoria,
  crearAcuerdo,
  crearAsesoria,
  listarAcuerdos,
  listarAsesorias,
} from '../api/tesistrack'
import useProyectoActivo from '../hooks/useProyectoActivo'
import { useAuth } from '../auth/AuthContext'
import BotonUnirse from '../components/BotonUnirse'
import ConfirmarAccion from '../components/ConfirmarAccion'
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
import { aInputLocal, desdeInputLocal, mananaALas10 } from '../utils/formato'

/**
 * Asesorías y acuerdos: la otra cadena de trazabilidad.
 *
 * También es el canal de consultas del estudiante (Decisión 13). Cualquiera de los
 * dos abre una entrada; **solo el asesor le agrega acuerdos**, y de un acuerdo sale
 * una tarea. Por eso quién la registró va visible: es lo que distingue una consulta
 * del alumno de una reunión cargada por el asesor.
 *
 * Una asesoría se puede **programar** con fecha y el enlace de la videollamada
 * (Zoom, Meet: se pega a mano, no hay integración) y después marcarse como
 * realizada —el asesor completa el resumen— o cancelarse. Los acuerdos solo se
 * agregan a una realizada: no se acuerda nada en una reunión que no se hizo.
 *
 * Los acuerdos van anidados debajo de su asesoría en vez de detrás de un segundo
 * desplegable — mismo criterio que Observaciones con las versiones.
 */
export default function AsesoriasPage() {
  const { user } = useAuth()
  const esAsesor = user?.role === 'ASESOR'
  const { proyectos, activoId, seleccionar, cargando: cargandoProyectos } = useProyectoActivo()

  const [asesorias, setAsesorias] = useState([])
  const [acuerdos, setAcuerdos] = useState({})
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  // null | 'programar' | 'registrar'
  const [modo, setModo] = useState(null)
  const [tema, setTema] = useState('')
  const [resumen, setResumen] = useState('')
  const [cuando, setCuando] = useState(mananaALas10())
  const [enlace, setEnlace] = useState('')
  const [guardando, setGuardando] = useState(false)

  const [acuerdoDe, setAcuerdoDe] = useState(null)
  const [textoAcuerdo, setTextoAcuerdo] = useState('')

  const [reprogramando, setReprogramando] = useState(null)
  const [realizando, setRealizando] = useState(null)
  const [resumenRealizada, setResumenRealizada] = useState('')
  const [aCancelar, setACancelar] = useState(null)

  const recargar = useCallback(async () => {
    if (!activoId) return
    setCargando(true)
    try {
      const lista = await listarAsesorias(activoId)
      setAsesorias(lista)
      // Los acuerdos vienen por asesoría; se traen todos juntos para poder
      // anidarlos sin que la pantalla pida un clic más por cada una. Solo las
      // realizadas pueden tenerlos.
      const pares = await Promise.all(
        lista
          .filter((a) => a.estado === 'REALIZADA')
          .map(async (a) => [a.id, await listarAcuerdos(a.id).catch(() => [])]),
      )
      setAcuerdos(Object.fromEntries(pares))
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [activoId])

  useEffect(() => {
    recargar()
  }, [recargar])

  function abrir(nuevoModo) {
    if (modo === nuevoModo) return setModo(null)
    setTema('')
    setResumen('')
    setEnlace('')
    setCuando(mananaALas10())
    setModo(nuevoModo)
  }

  async function handleCrear(e) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      if (modo === 'programar') {
        await crearAsesoria(activoId, {
          fecha: desdeInputLocal(cuando),
          tema,
          estado: 'PROGRAMADA',
          enlace: enlace || null,
        })
      } else {
        await crearAsesoria(activoId, {
          fecha: new Date().toISOString(),
          tema,
          resumen: resumen || null,
        })
      }
      setModo(null)
      await recargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function correr(accion) {
    setError(null)
    try {
      await accion()
      await recargar()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleAcuerdo(asesoriaId) {
    await correr(async () => {
      await crearAcuerdo(asesoriaId, textoAcuerdo)
      setTextoAcuerdo('')
      setAcuerdoDe(null)
    })
  }

  if (cargandoProyectos) return <Cargando />
  if (!activoId) return <SinProyecto rol={user?.role} />

  const programadas = asesorias
    .filter((a) => a.estado === 'PROGRAMADA')
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const historial = asesorias.filter((a) => a.estado !== 'PROGRAMADA')

  function puedeGestionar(a) {
    // El asesor, o el estudiante que la abrió. El backend lo vuelve a verificar.
    return esAsesor || a.registradaPor?.id === user?.id
  }

  return (
    <>
      <PageHead
        titulo="Asesorías"
        descripcion={
          esAsesor
            ? 'Reuniones y consultas de tus grupos, con los acuerdos de cada una.'
            : 'Tus consultas al asesor y lo que se acordó en cada reunión.'
        }
      >
        <SelectorProyecto proyectos={proyectos} activoId={activoId} onChange={seleccionar} />
        <button type="button" className="btn btn--primario" onClick={() => abrir('programar')}>
          {modo === 'programar' ? 'Cancelar' : 'Programar reunión'}
        </button>
        <button type="button" className="btn btn--sutil" onClick={() => abrir('registrar')}>
          {modo === 'registrar'
            ? 'Cancelar'
            : esAsesor
              ? 'Registrar asesoría'
              : 'Hacer una consulta'}
        </button>
      </PageHead>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {modo && (
        <Card
          titulo={
            modo === 'programar'
              ? 'Programar una reunión'
              : esAsesor
                ? 'Nueva asesoría'
                : 'Nueva consulta'
          }
        >
          <form className="form" onSubmit={handleCrear}>
            <label>
              Tema
              <input
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder={
                  esAsesor ? 'Revisión del capítulo 2' : 'Duda sobre la muestra del estudio'
                }
                maxLength={255}
                autoFocus
                required
              />
            </label>

            {modo === 'programar' ? (
              <>
                <label>
                  Fecha y hora
                  <input
                    type="datetime-local"
                    value={cuando}
                    onChange={(e) => setCuando(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Enlace de la reunión <span className="tenue">(opcional si es presencial)</span>
                  <input
                    type="url"
                    value={enlace}
                    onChange={(e) => setEnlace(e.target.value)}
                    placeholder="https://meet.google.com/…"
                    pattern="https://.+"
                    title="El enlace tiene que empezar con https://"
                  />
                </label>
                <p className="tenue">
                  Creá la reunión en Zoom o Meet y pegá el enlace. {esAsesor ? 'El grupo' : 'Tu asesor'}{' '}
                  la va a ver acá y en su Dashboard con un botón para unirse.
                </p>
              </>
            ) : (
              <>
                <label>
                  {esAsesor ? 'Resumen' : 'Contá tu consulta'}{' '}
                  <span className="tenue">(opcional)</span>
                  <textarea rows={4} value={resumen} onChange={(e) => setResumen(e.target.value)} />
                </label>
                {!esAsesor && (
                  <p className="tenue">
                    Tu asesor la va a ver acá. Si de la conversación sale algo por hacer, él lo
                    deja como acuerdo y de ahí sale una tarea.
                  </p>
                )}
              </>
            )}

            <div className="form__acciones">
              <button type="submit" className="btn btn--primario" disabled={guardando}>
                {guardando ? 'Guardando…' : modo === 'programar' ? 'Programar' : 'Registrar'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {cargando ? (
        <Cargando />
      ) : asesorias.length === 0 ? (
        <Card>
          <Vacio>
            {esAsesor
              ? 'Todavía no hay asesorías en esta tesis.'
              : 'Todavía no hiciste ninguna consulta ni programaste una reunión. Usá los botones de arriba.'}
          </Vacio>
        </Card>
      ) : (
        <>
          {programadas.length > 0 && (
            <Card titulo={`Programadas (${programadas.length})`}>
              <ul className="asesorias">
                {programadas.map((a) => (
                  <li key={a.id} className="asesoria">
                    <header className="asesoria__cabecera">
                      <div>
                        <strong>{a.tema}</strong>
                        <span className="lista__meta">
                          {fechaHora(a.fecha)} · programó {a.registradaPor?.name}
                        </span>
                      </div>
                      <div className="acciones-fila">
                        <EstadoBadge estado={a.estado} tipo="asesoria" />
                        <BotonUnirse enlace={a.enlace} />
                      </div>
                    </header>

                    {reprogramando?.id === a.id && (
                      <form
                        className="form asesoria__form"
                        onSubmit={(e) => {
                          e.preventDefault()
                          correr(async () => {
                            await actualizarAsesoria(a.id, {
                              fecha: desdeInputLocal(reprogramando.cuando),
                              tema: reprogramando.tema,
                              enlace: reprogramando.enlace || null,
                            })
                            setReprogramando(null)
                          })
                        }}
                      >
                        <label>
                          Tema
                          <input
                            value={reprogramando.tema}
                            onChange={(e) => setReprogramando({ ...reprogramando, tema: e.target.value })}
                            maxLength={255}
                            required
                          />
                        </label>
                        <label>
                          Fecha y hora
                          <input
                            type="datetime-local"
                            value={reprogramando.cuando}
                            onChange={(e) => setReprogramando({ ...reprogramando, cuando: e.target.value })}
                            required
                          />
                        </label>
                        <label>
                          Enlace <span className="tenue">(opcional)</span>
                          <input
                            type="url"
                            value={reprogramando.enlace}
                            onChange={(e) => setReprogramando({ ...reprogramando, enlace: e.target.value })}
                            pattern="https://.+"
                            title="El enlace tiene que empezar con https://"
                          />
                        </label>
                        <div className="form__acciones">
                          <button type="submit" className="btn btn--primario">
                            Guardar cambios
                          </button>
                          <button type="button" className="btn btn--sutil" onClick={() => setReprogramando(null)}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    )}

                    {realizando === a.id && (
                      <div className="form asesoria__form">
                        <label>
                          Resumen de lo que se vio <span className="tenue">(opcional)</span>
                          <textarea
                            rows={3}
                            value={resumenRealizada}
                            onChange={(e) => setResumenRealizada(e.target.value)}
                            autoFocus
                          />
                        </label>
                        <p className="tenue">
                          Al marcarla como realizada ya podés agregarle acuerdos.
                        </p>
                        <div className="form__acciones">
                          <button
                            type="button"
                            className="btn btn--primario"
                            onClick={() =>
                              correr(async () => {
                                await cambiarEstadoAsesoria(a.id, 'REALIZADA', resumenRealizada)
                                setRealizando(null)
                                setResumenRealizada('')
                              })
                            }
                          >
                            Marcar como realizada
                          </button>
                          <button type="button" className="btn btn--sutil" onClick={() => setRealizando(null)}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {puedeGestionar(a) && !reprogramando && realizando !== a.id && (
                      <div className="acciones-fila">
                        {esAsesor && (
                          <button
                            type="button"
                            className="btn btn--sutil"
                            onClick={() => {
                              setResumenRealizada('')
                              setRealizando(a.id)
                            }}
                          >
                            Marcar como realizada
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn--sutil"
                          onClick={() =>
                            setReprogramando({
                              id: a.id,
                              tema: a.tema,
                              cuando: aInputLocal(a.fecha),
                              enlace: a.enlace ?? '',
                            })
                          }
                        >
                          Reprogramar
                        </button>
                        <button type="button" className="btn btn--sutil" onClick={() => setACancelar(a)}>
                          Cancelar reunión
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {historial.length > 0 && (
            <Card titulo={`${historial.length} ${historial.length === 1 ? 'entrada' : 'entradas'}`}>
              <ul className="asesorias">
                {historial.map((a) => {
                  const propios = acuerdos[a.id] ?? []
                  return (
                    <li key={a.id} className="asesoria">
                      <header className="asesoria__cabecera">
                        <div>
                          <strong>{a.tema}</strong>
                          <span className="lista__meta">
                            {fechaHora(a.fecha)} · registró {a.registradaPor?.name}
                          </span>
                        </div>
                        <EstadoBadge estado={a.estado} tipo="asesoria" />
                      </header>

                      {a.resumen && <p className="asesoria__resumen">{a.resumen}</p>}

                      {propios.length > 0 && (
                        <ul className="acuerdos">
                          {propios.map((ac) => (
                            <li key={ac.id}>
                              <span className="acuerdo__marca" aria-hidden="true">
                                ✓
                              </span>
                              {ac.descripcion}
                            </li>
                          ))}
                        </ul>
                      )}

                      {esAsesor &&
                        a.estado === 'REALIZADA' &&
                        (acuerdoDe === a.id ? (
                          <div className="form">
                            <label>
                              Acuerdo
                              <input
                                value={textoAcuerdo}
                                onChange={(e) => setTextoAcuerdo(e.target.value)}
                                placeholder="Rehacer la matriz para el viernes"
                                autoFocus
                              />
                            </label>
                            <div className="form__acciones">
                              <button
                                type="button"
                                className="btn btn--primario"
                                onClick={() => handleAcuerdo(a.id)}
                                disabled={!textoAcuerdo.trim()}
                              >
                                Guardar acuerdo
                              </button>
                              <button
                                type="button"
                                className="btn btn--sutil"
                                onClick={() => {
                                  setAcuerdoDe(null)
                                  setTextoAcuerdo('')
                                }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn--sutil"
                            onClick={() => setAcuerdoDe(a.id)}
                          >
                            Agregar acuerdo
                          </button>
                        ))}
                    </li>
                  )
                })}
              </ul>
            </Card>
          )}
        </>
      )}

      {aCancelar && (
        <ConfirmarAccion
          titulo="Cancelar esta reunión"
          etiquetaConfirmar="Cancelar reunión"
          onCerrar={() => setACancelar(null)}
          onConfirmar={async () => {
            await cambiarEstadoAsesoria(aCancelar.id, 'CANCELADA')
            setACancelar(null)
            await recargar()
          }}
        >
          <p>
            Vas a cancelar <strong>{aCancelar.tema}</strong> ({fechaHora(aCancelar.fecha)}). Queda
            en el historial como cancelada y deja de aparecer entre las próximas reuniones.
          </p>
        </ConfirmarAccion>
      )}
    </>
  )
}
