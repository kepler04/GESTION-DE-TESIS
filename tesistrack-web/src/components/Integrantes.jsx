import { useState } from 'react'
import { agregarEstudiante, quitarEstudiante } from '../api/tesistrack'
import { Card } from './ui'

/**
 * Los estudiantes de una tesis, que puede ser grupal.
 *
 * Lo maneja el propio grupo y no el asesor: la tesis es de ellos. Se suma por
 * **correo** y no eligiendo de una lista, porque listar a todos los estudiantes de
 * la plataforma para elegir uno sería exponer el padrón entero.
 */
export default function Integrantes({ proyecto, usuarioId, onCambio }) {
  const [abierto, setAbierto] = useState(false)
  const [email, setEmail] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  const integrantes = proyecto?.estudiantes ?? []
  const soy = integrantes.some((e) => e.id === usuarioId)

  async function handleAgregar(e) {
    e.preventDefault()
    setError(null)
    setOcupado(true)
    try {
      await agregarEstudiante(proyecto.id, email.trim())
      setEmail('')
      setAbierto(false)
      await onCambio()
    } catch (err) {
      setError(err.message)
    } finally {
      setOcupado(false)
    }
  }

  async function handleQuitar(estudiante) {
    setError(null)
    try {
      await quitarEstudiante(proyecto.id, estudiante.id)
      await onCambio()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Card
      titulo={integrantes.length === 1 ? 'Tesista' : `Tesistas (${integrantes.length})`}
      accion={
        soy ? (
          <button
            type="button"
            className="btn btn--sutil"
            onClick={() => setAbierto((v) => !v)}
          >
            {abierto ? 'Cerrar' : 'Sumar compañero'}
          </button>
        ) : null
      }
    >
      {error && (
        <p className="alerta" role="alert">
          {error}
        </p>
      )}

      <ul className="integrantes">
        {integrantes.map((e) => (
          <li key={e.id}>
            <div>
              <strong>{e.name}</strong>
              <span className="lista__meta">{e.email}</span>
            </div>
            {/* Nadie puede quedarse solo sin querer: con uno no se ofrece sacar. */}
            {soy && integrantes.length > 1 && (
              <button type="button" className="btn btn--sutil" onClick={() => handleQuitar(e)}>
                {e.id === usuarioId ? 'Salir de la tesis' : 'Quitar'}
              </button>
            )}
          </li>
        ))}
      </ul>

      {abierto && (
        <form className="form" onSubmit={handleAgregar}>
          <label>
            Correo de tu compañero
            <input
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="companero@universidad.edu"
              autoFocus
              required
            />
          </label>
          <p className="tenue">
            Tiene que tener una cuenta de estudiante ya creada. Al sumarlo comparte la tesis
            completa: entregas, observaciones y tareas.
          </p>
          <div className="form__acciones">
            <button type="submit" className="btn btn--primario" disabled={ocupado}>
              {ocupado ? 'Sumando…' : 'Sumar'}
            </button>
          </div>
        </form>
      )}
    </Card>
  )
}
