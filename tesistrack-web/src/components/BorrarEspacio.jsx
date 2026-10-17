import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { listarActividades } from '../api/tesistrack'

/**
 * Confirmación para borrar un espacio de trabajo.
 *
 * Mismo criterio que {@link BorrarProyecto} (Decisión 17): se pide **escribir el
 * nombre** en vez de un "¿estás seguro?", porque el borrado es irreversible y un
 * botón de confirmación se acepta de memoria.
 *
 * Lo importante del texto es separar lo que se pierde de lo que no. La primera
 * versión de este borrado era un `confirm()` que solo decía "los proyectos no se
 * borran" y no mencionaba las actividades, que son justo lo que se va.
 */
export default function BorrarEspacio({ area, tesis, onCerrar, onBorrado }) {
  const dialogo = useRef(null)
  const [texto, setTexto] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)
  // null mientras carga; si la consulta falla se muestra el texto sin el número.
  const [actividades, setActividades] = useState(null)

  useEffect(() => {
    dialogo.current?.showModal()
  }, [])

  useEffect(() => {
    let cancelado = false
    listarActividades(area.id)
      .then((lista) => !cancelado && setActividades(lista.length))
      .catch(() => !cancelado && setActividades(undefined))
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

  const cuentaActividades =
    typeof actividades === 'number'
      ? `Las ${actividades} ${actividades === 1 ? 'actividad' : 'actividades'} del espacio`
      : 'Las actividades del espacio'

  return createPortal(
    <dialog className="dialogo" ref={dialogo} onClose={onCerrar}>
      <div className="dialogo__cuerpo legal-texto">
        <h2>Borrar este espacio</h2>
        <p>
          Vas a borrar el espacio <strong>{area.nombre}</strong>.
        </p>

        <p className="dialogo__subtitulo">Se pierde</p>
        <ul className="dialogo__lista">
          <li>{cuentaActividades} y su tablero con el semáforo</li>
          <li>
            El código de invitación <code>{area.codigo}</code>: nadie más podrá entrar con él
          </li>
        </ul>

        <p className="dialogo__subtitulo">No se pierde</p>
        <ul className="dialogo__lista">
          <li>
            {tesis === 0
              ? 'Ninguna tesis está en este espacio todavía'
              : tesis === 1
                ? 'La tesis del espacio sigue entera, con sus entregas y observaciones'
                : `Las ${tesis} tesis del espacio siguen enteras, con sus entregas y observaciones`}
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
