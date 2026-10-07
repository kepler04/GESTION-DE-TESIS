import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cambiarAsesoriasPrivadas } from '../api/tesistrack'
import { useAuth } from '../auth/AuthContext'
import { Card, ErrorMsg, PageHead } from '../components/ui'
import { TEXTO_SIN_PRIVADAS } from '../utils/textos'

const NOMBRE_ROL = {
  ESTUDIANTE: 'Estudiante',
  ASESOR: 'Asesor',
  COORDINADOR: 'Coordinador',
}

/**
 * El perfil de quien tiene la sesión abierta.
 *
 * Por ahora lo único que se puede cambiar acá es la preferencia de asesorías
 * privadas del asesor (Decisión 24), que también se responde la primera vez que
 * entra al Dashboard. Es una preferencia, no un permiso: cambia qué ofrece el menú,
 * no qué puede hacer.
 */
export default function PerfilPage() {
  const { user, actualizarUsuario } = useAuth()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const esAsesor = user?.role === 'ASESOR'

  async function elegir(valor) {
    if (user.asesoriasPrivadas === valor) return
    setError(null)
    setGuardando(true)
    try {
      actualizarUsuario(await cambiarAsesoriasPrivadas(valor))
    } catch (err) {
      // Por ejemplo, "Todavía tenés 1 asesorado privado": se explica, no se oculta.
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <PageHead titulo="Mi perfil" descripcion="Tus datos y tus preferencias." />

      <Card titulo="Cuenta">
        <dl className="datos">
          <div>
            <dt>Nombre</dt>
            <dd>{user?.name}</dd>
          </div>
          <div>
            <dt>Correo</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Rol</dt>
            <dd>{NOMBRE_ROL[user?.role] ?? user?.role}</dd>
          </div>
        </dl>
      </Card>

      {esAsesor && (
        <Card titulo="Asesorías privadas">
          <p>
            <strong>¿Das asesorías privadas, fuera de una clase?</strong>
          </p>
          <p className="tenue">
            Si sí, vas a ver <em>Asesorías privadas</em> en el menú, con tus asesorados
            individuales, y los estudiantes te pueden elegir por tu nombre al crear su tesis. Si
            trabajás con clases o grupos, no lo necesitás.
          </p>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <fieldset className="preferencia" disabled={guardando}>
            <legend className="sr-only">Asesorías privadas</legend>
            <label>
              <input
                type="radio"
                name="asesorias-privadas"
                checked={user?.asesoriasPrivadas === true}
                onChange={() => elegir(true)}
              />
              Sí, doy asesorías privadas
            </label>
            <label>
              <input
                type="radio"
                name="asesorias-privadas"
                checked={user?.asesoriasPrivadas === false}
                onChange={() => elegir(false)}
              />
              No, trabajo con clases
            </label>
          </fieldset>

          {user?.asesoriasPrivadas === null && (
            <p className="tenue">Todavía no respondiste esta pregunta.</p>
          )}
          {user?.asesoriasPrivadas === false && <p className="tenue">{TEXTO_SIN_PRIVADAS}</p>}
          {user?.asesoriasPrivadas === true && (
            <p>
              <Link to="/asesorias-privadas">Ir a Asesorías privadas →</Link>
            </p>
          )}
        </Card>
      )}
    </>
  )
}
