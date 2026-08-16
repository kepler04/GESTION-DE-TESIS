import { useState } from 'react'
import { login } from '../api/auth'

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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-2.8-.4-4H24v7.3h12.1c-.2 2-1.6 5-4.5 7l6.9 5.4c4.1-3.8 6.6-9.4 6.6-15.7z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.9-5.4c-1.9 1.3-4.4 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.1l-7.1 5.5C8 40.9 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.5 28.4c-.5-1.4-.7-2.9-.7-4.4s.3-3 .7-4.4l-7.1-5.5C2.9 17 2 20.4 2 24s.9 7 2.4 9.9l7.1-5.5z"
      />
      <path
        fill="#EA4335"
        d="M24 10.2c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.9 3.9 29.9 2 24 2 15.4 2 8 7.1 4.4 14.1l7.1 5.5c1.8-5.3 6.7-9.4 12.5-9.4z"
      />
    </svg>
  )
}

export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await login({ email, password })
      onSuccess(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-field">
        <MailIcon />
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="auth-field">
        <LockIcon />
        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          placeholder="Contraseña"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="auth-submit" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>

      {/* Sin OAuth en el backend todavía: se muestra deshabilitado para no prometer algo que no funciona. */}
      <button type="button" className="auth-oauth" disabled title="Próximamente">
        <GoogleIcon />
        Ingresar con Google
      </button>

      <p className="auth-foot">
        ¿Olvidaste tu contraseña?{' '}
        <button type="button" disabled title="Próximamente">
          Recuperala acá
        </button>
      </p>
    </form>
  )
}
