import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Confirmación para borrar una tesis.
 *
 * Pide **escribir el título** en vez de un "¿estás seguro?". No es burocracia: el
 * borrado es irreversible, no hay papelera, y se lleva las entregas y observaciones
 * de otra persona. Un botón de confirmación se acepta de memoria; escribir el
 * título obliga a mirar cuál se está por borrar.
 *
 * Va en un portal, como la política de privacidad: dentro de la tabla heredaría
 * estilos que no le corresponden.
 */
export default function BorrarProyecto({ proyecto, onCerrar, onBorrado }) {
  const dialogo = useRef(null)
  const [texto, setTexto] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    dialogo.current?.showModal()
  }, [])

  const coincide = texto.trim() === proyecto.titulo.trim()

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

  return createPortal(
    <dialog className="dialogo" ref={dialogo} onClose={onCerrar}>
      <div className="dialogo__cuerpo legal-texto">
        <h2>Borrar esta tesis</h2>
        <p>
          Vas a borrar <strong>{proyecto.titulo}</strong> y todo lo que cuelga de ella.
        </p>

        <ul className="dialogo__lista">
          <li>Los hitos, con sus entregas y los archivos subidos</li>
          <li>Las observaciones registradas sobre cada versión</li>
          <li>Las asesorías, sus acuerdos y las tareas</li>
        </ul>

        <p className="dialogo__aviso">
          Es <strong>irreversible</strong>: no hay papelera ni forma de recuperarlo.
          {(proyecto.estudiantes ?? []).length > 0 && (
            <> El trabajo es de {proyecto.estudiantes.map((e) => e.name).join(' y ')}.</>
          )}
        </p>

        {error && (
          <p className="alerta" role="alert">
            {error}
          </p>
        )}

        <label className="dialogo__campo">
          Escribí <code>{proyecto.titulo}</code> para confirmar
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
