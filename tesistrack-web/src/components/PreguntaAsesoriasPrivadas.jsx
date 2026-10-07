import { useState } from 'react'
import { cambiarAsesoriasPrivadas } from '../api/tesistrack'
import { useAuth } from '../auth/AuthContext'
import { TEXTO_SIN_PRIVADAS } from '../utils/textos'
import { Card } from './ui'

/**
 * "¿Das asesorías privadas, fuera de una clase?"
 *
 * Se le pregunta al asesor la primera vez que entra, y a los asesores que ya tenían
 * cuenta cuando se agregó la pregunta, hasta que responde. Es una **preferencia**,
 * no un permiso (Decisión 24): decide si el menú le ofrece "Asesorías privadas" y si
 * los estudiantes lo pueden elegir por su nombre; se cambia después desde el perfil.
 *
 * Si responde que **no**, se le explica una sola vez para qué sirve cada cosa, con
 * el texto exacto de la decisión, y recién ahí desaparece la tarjeta.
 */
export default function PreguntaAsesoriasPrivadas() {
  const { user, actualizarUsuario } = useAuth()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  // Tras responder "no" se muestra la explicación hasta que la cierre.
  const [explicando, setExplicando] = useState(false)

  const sinResponder = user?.asesoriasPrivadas === null || user?.asesoriasPrivadas === undefined
  if (!sinResponder && !explicando) return null

  async function responder(valor) {
    setError(null)
    setGuardando(true)
    try {
      actualizarUsuario(await cambiarAsesoriasPrivadas(valor))
      if (!valor) setExplicando(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  if (explicando) {
    return (
      <Card titulo="Listo, no ofrecemos asesorías privadas">
        <p>{TEXTO_SIN_PRIVADAS}</p>
        <p className="tenue">Podés cambiarlo cuando quieras desde tu perfil.</p>
        <div className="form__acciones">
          <button type="button" className="btn btn--primario" onClick={() => setExplicando(false)}>
            Entendido
          </button>
        </div>
      </Card>
    )
  }

  return (
    <Card titulo="Una pregunta antes de empezar">
      <p>
        <strong>¿Das asesorías privadas, fuera de una clase?</strong>
      </p>
      <p className="tenue">
        Si sí, vas a ver en el menú <em>Asesorías privadas</em> con tus asesorados individuales, y
        los estudiantes te podrán elegir por tu nombre. Si trabajás con clases o grupos, no lo
        necesitás. Lo podés cambiar después desde tu perfil.
      </p>
      {error && (
        <p className="alerta" role="alert">
          {error}
        </p>
      )}
      <div className="form__acciones">
        <button
          type="button"
          className="btn btn--primario"
          disabled={guardando}
          onClick={() => responder(true)}
        >
          Sí, doy asesorías privadas
        </button>
        <button
          type="button"
          className="btn btn--sutil"
          disabled={guardando}
          onClick={() => responder(false)}
        >
          No, trabajo con clases
        </button>
      </div>
    </Card>
  )
}
