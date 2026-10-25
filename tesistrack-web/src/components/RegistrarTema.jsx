import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { registrarTema } from '../api/tesistrack'

/**
 * Registrar el tema de una tesis que estaba "por definir" (Decisión 29). Lo usa
 * cualquier integrante: el tema es del grupo.
 */
export default function RegistrarTema({ proyecto, onCerrar, onListo }) {
  const dialogo = useRef(null)
  const [titulo, setTitulo] = useState(proyecto.titulo ?? '')
  const [descripcion, setDescripcion] = useState(proyecto.descripcion ?? '')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    dialogo.current?.showModal()
  }, [])

  async function guardar(e) {
    e.preventDefault()
    setOcupado(true)
    setError(null)
    try {
      await registrarTema(proyecto.id, titulo.trim(), descripcion.trim() || null)
      await onListo()
    } catch (err) {
      setError(err.message)
      setOcupado(false)
    }
  }

  return createPortal(
    <dialog className="dialogo" ref={dialogo} onClose={onCerrar} aria-labelledby="registrar-tema-titulo">
      <form className="dialogo__cuerpo form" onSubmit={guardar}>
        <h2 id="registrar-tema-titulo">{proyecto.titulo ? 'Cambiar el tema' : 'Registrar mi tema'}</h2>
        {error && (
          <p className="alerta" role="alert">
            {error}
          </p>
        )}
        <label>
          Tema de tu tesis
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={255} autoFocus required />
        </label>
        <label>
          Descripción <span className="tenue">(opcional)</span>
          <textarea rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </label>
        <p className="tenue">Lo ven tu grupo y tu profesor. Se puede ajustar después.</p>
        <div className="form__acciones">
          <button type="submit" className="btn btn--primario" disabled={ocupado || !titulo.trim()}>
            {ocupado ? 'Guardando…' : 'Guardar tema'}
          </button>
          <button type="button" className="btn btn--sutil" onClick={onCerrar} disabled={ocupado}>
            Cancelar
          </button>
        </div>
      </form>
    </dialog>,
    document.body,
  )
}
