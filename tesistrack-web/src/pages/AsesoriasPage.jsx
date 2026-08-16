import { useCallback, useEffect, useState } from 'react'
import {
  crearAcuerdo,
  crearAsesoria,
  listarAcuerdos,
  listarAsesorias,
} from '../api/tesistrack'
import useProyectoActivo from '../hooks/useProyectoActivo'
import { useAuth } from '../auth/AuthContext'
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
 * Asesorías y acuerdos: la otra cadena de trazabilidad.
 *
 * También es el canal de consultas del estudiante (Decisión 13). Cualquiera de los
 * dos abre una entrada; **solo el asesor le agrega acuerdos**, y de un acuerdo sale
 * una tarea. Por eso quién la registró va visible: es lo que distingue una consulta
 * del alumno de una reunión cargada por el asesor.
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

  const [mostrarForm, setMostrarForm] = useState(false)
  const [tema, setTema] = useState('')
  const [resumen, setResumen] = useState('')
  const [guardando, setGuardando] = useState(false)

  const [acuerdoDe, setAcuerdoDe] = useState(null)
  const [textoAcuerdo, setTextoAcuerdo] = useState('')

  const recargar = useCallback(async () => {
    if (!activoId) return
    setCargando(true)
    try {
      const lista = await listarAsesorias(activoId)
      setAsesorias(lista)
      // Los acuerdos vienen por asesoría; se traen todos juntos para poder
      // anidarlos sin que la pantalla pida un clic más por cada una.
      const pares = await Promise.all(
        lista.map(async (a) => [a.id, await listarAcuerdos(a.id).catch(() => [])]),
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

  async function handleCrear(e) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      await crearAsesoria(activoId, {
        fecha: new Date().toISOString(),
        tema,
        resumen: resumen || null,
      })
      setTema('')
      setResumen('')
      setMostrarForm(false)
      await recargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleAcuerdo(asesoriaId) {
    setError(null)
    try {
      await crearAcuerdo(asesoriaId, textoAcuerdo)
      setTextoAcuerdo('')
      setAcuerdoDe(null)
      await recargar()
    } catch (err) {
      setError(err.message)
    }
  }

  if (cargandoProyectos) return <Cargando />
  if (!activoId) return <SinProyecto rol={user?.role} />

  return (
    <>
      <PageHead
        titulo="Asesorías"
        descripcion={
          esAsesor
            ? 'Reuniones y consultas de tus asesorados, con los acuerdos de cada una.'
            : 'Tus consultas al asesor y lo que se acordó en cada reunión.'
        }
      >
        <SelectorProyecto proyectos={proyectos} activoId={activoId} onChange={seleccionar} />
        <button
          type="button"
          className="btn btn--primario"
          onClick={() => setMostrarForm((v) => !v)}
        >
          {mostrarForm ? 'Cancelar' : esAsesor ? 'Registrar asesoría' : 'Hacer una consulta'}
        </button>
      </PageHead>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {mostrarForm && (
        <Card titulo={esAsesor ? 'Nueva asesoría' : 'Nueva consulta'}>
          <form className="form" onSubmit={handleCrear}>
            <label>
              Tema
              <input
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder={
                  esAsesor ? 'Revisión del capítulo 2' : 'Duda sobre la muestra del estudio'
                }
                autoFocus
                required
              />
            </label>
            <label>
              {esAsesor ? 'Resumen' : 'Contá tu consulta'} <span className="tenue">(opcional)</span>
              <textarea rows={4} value={resumen} onChange={(e) => setResumen(e.target.value)} />
            </label>
            {!esAsesor && (
              <p className="tenue">
                Tu asesor la va a ver acá. Si de la conversación sale algo por hacer, él lo deja
                como acuerdo y de ahí sale una tarea.
              </p>
            )}
            <div className="form__acciones">
              <button type="submit" className="btn btn--primario" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Registrar'}
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
              ? 'Todavía no hay asesorías registradas en este proyecto.'
              : 'Todavía no hiciste ninguna consulta. Usá el botón de arriba para escribirle a tu asesor.'}
          </Vacio>
        </Card>
      ) : (
        <Card titulo={`${asesorias.length} ${asesorias.length === 1 ? 'entrada' : 'entradas'}`}>
          <ul className="asesorias">
            {asesorias.map((a) => {
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
  )
}
