import { useCallback, useEffect, useState } from 'react'
import {
  actualizarSesion,
  crearSesion,
  eliminarSesion,
  listarSesiones,
} from '../api/tesistrack'
import BotonUnirse from './BotonUnirse'
import ConfirmarAccion from './ConfirmarAccion'
import {
  Card,
  Cargando,
  ErrorMsg,
  Vacio,
  fechaHora,
} from './ui'
import { aInputLocal, desdeInputLocal, mananaALas10 } from '../utils/formato'

/** Una sesión que empezó hace menos de esto se sigue mostrando como "en curso". */
const EN_CURSO_MS = 60 * 60 * 1000

/**
 * Las clases o reuniones de todo el espacio, con su enlace y un botón Unirse.
 *
 * La crea el asesor dueño pegando el enlace de Zoom o Meet: no hay integración con
 * ninguna videollamada. Los miembros solo las ven. Las que ya pasaron quedan en un
 * desplegable aparte para que "próximas" no se llene de historia.
 */
export default function SesionesEspacio({ areaId, editable }) {
  const [sesiones, setSesiones] = useState(null)
  const [error, setError] = useState(null)
  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [titulo, setTitulo] = useState('')
  const [cuando, setCuando] = useState(mananaALas10())
  const [enlace, setEnlace] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [aQuitar, setAQuitar] = useState(null)

  const recargar = useCallback(
    () =>
      listarSesiones(areaId)
        .then(setSesiones)
        .catch((e) => setError(e.message)),
    [areaId],
  )

  useEffect(() => {
    recargar()
  }, [recargar])

  function abrirNueva() {
    setEditando(null)
    setTitulo('')
    setCuando(mananaALas10())
    setEnlace('')
    setFormAbierto(true)
  }

  function abrirEdicion(sesion) {
    setEditando(sesion.id)
    setTitulo(sesion.titulo)
    setCuando(aInputLocal(sesion.fechaHora))
    setEnlace(sesion.enlace)
    setFormAbierto(true)
  }

  async function handleGuardar(e) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      const cuerpo = { titulo, fechaHora: desdeInputLocal(cuando), enlace }
      if (editando) await actualizarSesion(editando, cuerpo)
      else await crearSesion(areaId, cuerpo)
      setFormAbierto(false)
      await recargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  if (sesiones === null && !error) return <Cargando />

  const lista = sesiones ?? []
  const limite = Date.now() - EN_CURSO_MS
  const proximas = lista.filter((s) => new Date(s.fechaHora).getTime() >= limite)
  const pasadas = lista.filter((s) => new Date(s.fechaHora).getTime() < limite).reverse()

  return (
    <Card
      titulo="Próximas sesiones"
      accion={
        editable && (
          <button
            type="button"
            className="btn btn--sutil"
            onClick={() => (formAbierto ? setFormAbierto(false) : abrirNueva())}
          >
            {formAbierto ? 'Cancelar' : 'Nueva sesión'}
          </button>
        )
      }
    >
      {error && <ErrorMsg>{error}</ErrorMsg>}

      {formAbierto && (
        <form className="form sesion__form" onSubmit={handleGuardar}>
          <label>
            Título
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Clase 3 — Marco teórico"
              maxLength={160}
              autoFocus
              required
            />
          </label>
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
            Enlace de la reunión
            <input
              type="url"
              value={enlace}
              onChange={(e) => setEnlace(e.target.value)}
              placeholder="https://meet.google.com/…"
              pattern="https://.+"
              title="El enlace tiene que empezar con https://"
              required
            />
          </label>
          <p className="tenue">
            Creá la reunión en Zoom o Meet y pegá acá el enlace. Los miembros del espacio van a
            ver un botón para unirse.
          </p>
          <div className="form__acciones">
            <button type="submit" className="btn btn--primario" disabled={guardando}>
              {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear sesión'}
            </button>
          </div>
        </form>
      )}

      {proximas.length === 0 ? (
        <Vacio>
          {editable
            ? 'No hay sesiones programadas. Creá una y tus estudiantes la ven con un botón para unirse.'
            : 'Tu asesor todavía no programó ninguna sesión.'}
        </Vacio>
      ) : (
        <ul className="lista sesiones">
          {proximas.map((s) => {
            const enCurso = new Date(s.fechaHora).getTime() <= Date.now()
            return (
              <li key={s.id}>
                <div>
                  <strong>{s.titulo}</strong>
                  <span className="lista__meta">
                    {fechaHora(s.fechaHora)}
                    {enCurso && <span className="tag tag--ahora">En curso</span>}
                  </span>
                </div>
                <div className="acciones-fila">
                  <BotonUnirse enlace={s.enlace} />
                  {editable && (
                    <>
                      <button type="button" className="btn btn--sutil" onClick={() => abrirEdicion(s)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn--sutil" onClick={() => setAQuitar(s)}>
                        Quitar
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {pasadas.length > 0 && (
        <details className="sesiones__pasadas">
          <summary>Sesiones anteriores ({pasadas.length})</summary>
          <ul className="lista">
            {pasadas.map((s) => (
              <li key={s.id}>
                <div>
                  <strong>{s.titulo}</strong>
                  <span className="lista__meta">{fechaHora(s.fechaHora)}</span>
                </div>
                {editable && (
                  <button type="button" className="btn btn--sutil" onClick={() => setAQuitar(s)}>
                    Quitar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      {aQuitar && (
        <ConfirmarAccion
          titulo="Quitar esta sesión"
          etiquetaConfirmar="Quitar sesión"
          onCerrar={() => setAQuitar(null)}
          onConfirmar={async () => {
            await eliminarSesion(aQuitar.id)
            setAQuitar(null)
            await recargar()
          }}
        >
          <p>
            Vas a quitar <strong>{aQuitar.titulo}</strong> ({fechaHora(aQuitar.fechaHora)}). Los
            estudiantes dejan de ver la sesión y su enlace.
          </p>
        </ConfirmarAccion>
      )}
    </Card>
  )
}
