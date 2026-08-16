import { useState } from 'react'
import { Link } from 'react-router-dom'
import { existeEmail, register } from '../api/auth'
import FuerzaContrasena from './FuerzaContrasena'
import PoliticaModal from './PoliticaModal'

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0115 0" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function CapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4l9 4-9 4-9-4 9-4z" />
      <path d="M7 11v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="17" rx="2" />
      <path d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h6" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 01-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 01-10.7-3.8H1.3v3.1A12 12 0 0012 24z"
      />
      <path fill="#FBBC05" d="M5.3 14.3a7.1 7.1 0 010-4.6V6.6H1.3a12 12 0 000 10.8l4-3.1z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5A12 12 0 001.3 6.6l4 3.1A7.2 7.2 0 0112 4.8z"
      />
    </svg>
  )
}

/**
 * Registro en dos pasos.
 *
 *   Paso 1 — credenciales: correo y contraseña (y, cuando exista el OAuth Client
 *            ID, el alta con Google).
 *   Paso 2 — perfil: quién sos, qué rol tenés y el consentimiento de la política.
 *
 * La cuenta se crea recién al enviar el paso 2: un solo POST con todo. Si alguien
 * abandona a mitad no queda una cuenta huérfana sin perfil.
 *
 * `COORDINADOR` no está en el selector a propósito. Ese rol lee todos los
 * proyectos de la plataforma (Decisión 8); si fuera autoasignable, cualquiera se
 * registraría como coordinador y leería tesis ajenas. El backend además lo
 * rechaza, así que la UI solo refleja una regla que ya existe.
 */
const ROLES = [
  { valor: 'ESTUDIANTE', etiqueta: 'Estudiante', ayuda: 'Presentás una tesis y subís tus entregas.' },
  { valor: 'ASESOR', etiqueta: 'Asesor', ayuda: 'Acompañás tesis: definís hitos y observás entregas.' },
]

export default function RegisterForm({ onSuccess }) {
  const [paso, setPaso] = useState(1)

  // paso 1
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // paso 2
  const [name, setName] = useState('')
  const [telefono, setTelefono] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [role, setRole] = useState('ESTUDIANTE')
  const [carrera, setCarrera] = useState('')
  const [organizacion, setOrganizacion] = useState('')
  const [aceptaPolitica, setAceptaPolitica] = useState(false)
  const [verPolitica, setVerPolitica] = useState(false)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [correoEnUso, setCorreoEnUso] = useState(false)
  const [verificando, setVerificando] = useState(false)

  /**
   * Antes de pasar al perfil, preguntamos si el correo ya tiene cuenta. Sin esto,
   * alguien cargaba los seis campos del paso 2 para recién ahí enterarse.
   *
   * Si la consulta falla (backend caído, límite de frecuencia alcanzado) dejamos
   * seguir: el registro valida igual al final, así que un problema de red no
   * puede dejar a nadie sin poder crear su cuenta.
   */
  async function handleContinuar(e) {
    e.preventDefault()
    setError(null)
    setCorreoEnUso(false)
    setVerificando(true)
    try {
      const { existe } = await existeEmail(email)
      if (existe) {
        setCorreoEnUso(true)
        return
      }
      setPaso(2)
    } catch {
      setPaso(2)
    } finally {
      setVerificando(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await register({
        name,
        email,
        password,
        role,
        telefono,
        ubicacion,
        carrera,
        organizacion,
        aceptaPolitica,
      })
      onSuccess(data)
    } catch (err) {
      setError(err.message)
      // El correo se valida contra la base recién en este POST. Si el problema
      // es ese, devolvemos a la persona al paso donde puede corregirlo.
      if (/email|correo/i.test(err.message)) {
        setPaso(1)
      }
    } finally {
      setLoading(false)
    }
  }

  const mensajeError = error && (
    <p className="auth-error" role="alert">
      {error}
    </p>
  )

  if (paso === 1) {
    return (
      <form className="auth-form" onSubmit={handleContinuar}>
        <p className="auth-pasos" aria-label="Paso 1 de 2">
          <span className="auth-pasos__punto is-activo" />
          <span className="auth-pasos__punto" />
          <span className="auth-pasos__texto">Paso 1 de 2 · Tu acceso</span>
        </p>

        <div className="auth-field">
          <MailIcon />
          <label htmlFor="register-email">Correo</label>
          <input
            id="register-email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              // Al corregir el correo, el aviso deja de aplicar.
              setCorreoEnUso(false)
            }}
            autoComplete="email"
            required
          />
        </div>

        <div className="auth-field">
          <LockIcon />
          <label htmlFor="register-password">Contraseña</label>
          <input
            id="register-password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            aria-describedby="fuerza-password"
          />
        </div>

        <div id="fuerza-password">
          <FuerzaContrasena valor={password} email={email} />
        </div>

        {correoEnUso && (
          <div className="auth-en-uso" role="alert">
            <p className="auth-en-uso__titulo">Ese correo ya tiene una cuenta.</p>
            <div className="auth-en-uso__salidas">
              <Link className="btn-enlace" to="/login">
                Iniciar sesión
              </Link>
              <button type="button" className="btn-enlace" disabled title="Próximamente">
                Recuperar contraseña
              </button>
            </div>
            <p className="auth-en-uso__nota">
              La recuperación de contraseña todavía no está disponible.
            </p>
          </div>
        )}

        {mensajeError}

        <button type="submit" className="auth-submit" disabled={verificando}>
          {verificando ? 'Verificando…' : 'Continuar'}
        </button>

        <button type="button" className="auth-oauth" disabled title="Próximamente">
          <GoogleIcon />
          Continuar con Google
        </button>
      </form>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <p className="auth-pasos" aria-label="Paso 2 de 2">
        <span className="auth-pasos__punto is-activo" />
        <span className="auth-pasos__punto is-activo" />
        <span className="auth-pasos__texto">Paso 2 de 2 · Tu perfil</span>
      </p>

      <div className="auth-field">
        <UserIcon />
        <label htmlFor="register-name">Nombre</label>
        <input
          id="register-name"
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>

      <fieldset className="auth-roles">
        <legend>¿Cómo vas a usar TesisTrack?</legend>
        {ROLES.map((r) => (
          <label key={r.valor} className={`auth-rol ${role === r.valor ? 'is-elegido' : ''}`}>
            <input
              type="radio"
              name="role"
              value={r.valor}
              checked={role === r.valor}
              onChange={(e) => setRole(e.target.value)}
            />
            <span className="auth-rol__nombre">{r.etiqueta}</span>
            <span className="auth-rol__ayuda">{r.ayuda}</span>
          </label>
        ))}
      </fieldset>

      <div className="auth-field">
        <CapIcon />
        <label htmlFor="register-carrera">Carrera</label>
        <input
          id="register-carrera"
          type="text"
          placeholder="Carrera o área (opcional)"
          value={carrera}
          onChange={(e) => setCarrera(e.target.value)}
        />
      </div>

      <div className="auth-field">
        <BuildingIcon />
        <label htmlFor="register-organizacion">Universidad u organización</label>
        <input
          id="register-organizacion"
          type="text"
          placeholder="Universidad, organización o independiente (opcional)"
          value={organizacion}
          onChange={(e) => setOrganizacion(e.target.value)}
        />
      </div>

      <div className="auth-field">
        <PhoneIcon />
        <label htmlFor="register-telefono">Teléfono</label>
        <input
          id="register-telefono"
          type="tel"
          placeholder="Teléfono (opcional)"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          autoComplete="tel"
        />
      </div>

      <div className="auth-field">
        <PinIcon />
        <label htmlFor="register-ubicacion">Ubicación</label>
        <input
          id="register-ubicacion"
          type="text"
          placeholder="Ciudad o país (opcional)"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
        />
      </div>

      <div className="auth-consentimiento">
        <input
          id="acepta-politica"
          type="checkbox"
          checked={aceptaPolitica}
          onChange={(e) => setAceptaPolitica(e.target.checked)}
          required
        />
        <label htmlFor="acepta-politica">
          Leí y acepto la{' '}
          <button
            type="button"
            className="auth-consentimiento__enlace"
            // Sin frenar la propagación, el clic llega a la etiqueta y termina
            // marcando el consentimiento: abrir el texto no es aceptarlo.
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setVerPolitica(true)
            }}
          >
            política de privacidad
          </button>{' '}
          y el tratamiento de mis datos para el seguimiento de asesorías.
        </label>
      </div>

      <PoliticaModal abierto={verPolitica} onCerrar={() => setVerPolitica(false)} />

      {mensajeError}

      <button type="submit" className="auth-submit" disabled={loading || !aceptaPolitica}>
        {loading ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>

      <button type="button" className="auth-atras" onClick={() => setPaso(1)} disabled={loading}>
        ← Volver al paso anterior
      </button>
    </form>
  )
}
