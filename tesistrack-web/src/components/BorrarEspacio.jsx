import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { resumenEspacio } from '../api/tesistrack'
import { plural } from '../utils/formato'

/**
 * Confirmación para borrar un espacio de trabajo.
 *
 * Mismo criterio que {@link BorrarProyecto} (Decisión 17): se pide **escribir el
 * nombre** en vez de un "¿estás seguro?", porque el borrado es irreversible y un
 * botón de confirmación se acepta de memoria.
 *
 * Lo importante del texto es separar lo que se pierde de lo que no, **con números**:
 * las actividades, las carpetas con sus materiales y archivos subidos, y las
 * sesiones se van; las tesis y todos sus hitos se quedan (Decisión 18). Los
 * números salen del backend (`GET /areas/{id}/resumen`), no de lo que la pantalla
 * casualmente tenga cargado.
 */
export default function BorrarEspacio({ area, onCerrar, onBorrado }) {
  const dialogo = useRef(null)
  const [texto, setTexto] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)
  // null mientras carga; undefined si la consulta falla (se muestra sin números).
  const [resumen, setResumen] = useState(null)

  useEffect(() => {
    dialogo.current?.showModal()
  }, [])

  useEffect(() => {
    let cancelado = false
    resumenEspacio(area.id)
      .then((r) => !cancelado && setResumen(r))
      .catch(() => !cancelado && setResumen(undefined))
    return () => {
      cancelado = true
    }
  }, [area.id])

  const coincide = texto.trim() === area.nombre.trim()

  async function handleBorrar() {
    setError(null)
    setOcupado(true)
    try {
      await onBorrado()
    } catch (err) {
      setError(err.message)
      setOcupado(false)
    }
  }

  const conNumeros = typeof resumen === 'object' && resumen !== null

  return createPortal(
    <dialog className="dialogo" ref={dialogo} onClose={onCerrar}>
      <div className="dialogo__cuerpo legal-texto">
        <h2>Borrar este espacio</h2>
        <p>
          Vas a borrar el espacio <strong>{area.nombre}</strong>.
        </p>

        <p className="dialogo__subtitulo">Se pierde</p>
        <ul className="dialogo__lista">
          <li>
            {conNumeros
              ? `${plural(resumen.actividades, 'actividad', 'actividades')} del espacio`
              : 'Las actividades del espacio'}{' '}
            y su tablero con el semáforo
          </li>
          <li>
            {conNumeros ? (
              resumen.carpetas === 0 ? (
                'Los materiales: no hay carpetas todavía'
              ) : (
                <>
                  {plural(resumen.carpetas, 'carpeta', 'carpetas')} de materiales con{' '}
                  {plural(resumen.materiales, 'material', 'materiales')}
                  {resumen.archivos > 0 && (
                    <>
                      , de los cuales <strong>{plural(resumen.archivos, 'archivo subido', 'archivos subidos')}</strong>{' '}
                      (no se pueden recuperar)
                    </>
                  )}
                </>
              )
            ) : (
              'Las carpetas de materiales, con sus enlaces y archivos subidos'
            )}
          </li>
          <li>
            {conNumeros
              ? `${plural(resumen.sesiones, 'sesión', 'sesiones')} con su enlace de reunión`
              : 'Las sesiones con su enlace de reunión'}
          </li>
          <li>
            El código de invitación <code>{area.codigo}</code>: nadie más podrá entrar con él
          </li>
        </ul>

        <p className="dialogo__subtitulo">No se pierde</p>
        <ul className="dialogo__lista">
          <li>
            {!conNumeros
              ? 'Las tesis del espacio siguen enteras, con sus entregas y observaciones'
              : resumen.tesis === 0
                ? 'Ninguna tesis está en este espacio todavía'
                : resumen.tesis === 1
                  ? 'La tesis del espacio sigue entera, con sus entregas y observaciones'
                  : `Las ${resumen.tesis} tesis del espacio siguen enteras, con sus entregas y observaciones`}
          </li>
          <li>Los hitos que nacieron de las actividades siguen en cada tesis como hitos comunes</li>
        </ul>

        <p className="dialogo__aviso">
          Es <strong>irreversible</strong>: no hay papelera ni forma de recuperarlo.
        </p>

        {error && (
          <p className="alerta" role="alert">
            {error}
          </p>
        )}

        <label className="dialogo__campo">
          Escribí <code>{area.nombre}</code> para confirmar
          <input value={texto} onChange={(e) => setTexto(e.target.value)} autoFocus />
        </label>

        <div className="form__acciones">
          <button
            type="button"
            className="btn btn--peligro"
            onClick={handleBorrar}
            disabled={!coincide || ocupado}
          >
            {ocupado ? 'Borrando…' : 'Borrar definitivamente'}
          </button>
          <button type="button" className="btn btn--sutil" onClick={onCerrar} disabled={ocupado}>
            Cancelar
          </button>
        </div>
      </div>
    </dialog>,
    document.body,
  )
}
