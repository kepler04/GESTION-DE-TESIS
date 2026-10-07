import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Confirmación para una acción que no se puede deshacer pero que no llega a pedir
 * escribir un nombre (eso queda para borrar un espacio o una tesis, que se llevan
 * el trabajo de otros). Sirve para quitar una carpeta, un material o una sesión.
 *
 * Dice **qué se pierde** en el cuerpo, no solo "¿estás seguro?": un botón que se
 * acepta de memoria no protege de nada.
 */
export default function ConfirmarAccion({
  titulo,
  children,
  etiquetaConfirmar = 'Confirmar',
  peligro = true,
  onConfirmar,
  onCerrar,
}) {
  const dialogo = useRef(null)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    dialogo.current?.showModal()
  }, [])

  async function handleConfirmar() {
    setError(null)
    setOcupado(true)
    try {
      await onConfirmar()
    } catch (err) {
      setError(err.message)
      setOcupado(false)
    }
  }

  return createPortal(
    <dialog className="dialogo" ref={dialogo} onClose={onCerrar}>
      <div className="dialogo__cuerpo legal-texto">
        <h2>{titulo}</h2>
        <div className="dialogo__texto">{children}</div>

        {error && (
          <p className="alerta" role="alert">
            {error}
          </p>
        )}

        <div className="form__acciones">
          <button
            type="button"
            className={`btn ${peligro ? 'btn--peligro' : 'btn--primario'}`}
            onClick={handleConfirmar}
            disabled={ocupado}
          >
            {ocupado ? 'Un momento…' : etiquetaConfirmar}
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
