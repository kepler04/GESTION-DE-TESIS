import { useState } from 'react'
import { register } from '../api/auth'

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

export default function RegisterForm({ onSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('ESTUDIANTE')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await register({ name, email, password, role })
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
        <UserIcon />
        <label htmlFor="register-name">Nombre</label>
        <input
          id="register-name"
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="auth-field">
        <MailIcon />
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          minLength={8}
          required
        />
      </div>

      <div className="auth-field">
        <label htmlFor="register-role">Rol</label>
        <select id="register-role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="ESTUDIANTE">Estudiante</option>
          <option value="ASESOR">Asesor</option>
        </select>
      </div>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="auth-submit" disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}
