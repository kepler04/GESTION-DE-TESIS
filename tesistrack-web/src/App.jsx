import { useState } from 'react'
import AuthLayout from './components/AuthLayout'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'

function loadSession() {
  const token = localStorage.getItem('token')
  const userRaw = localStorage.getItem('user')
  if (!token || !userRaw) return null
  try {
    return { token, user: JSON.parse(userRaw) }
  } catch {
    return null
  }
}

function App() {
  const [session, setSession] = useState(loadSession)
  const [view, setView] = useState('login')

  function handleAuthSuccess({ token, user }) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setSession({ token, user })
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setSession(null)
    setView('login')
  }

  if (session) {
    return (
      <main>
        <h1>TesisTrack</h1>
        <p>
          Sesión iniciada como <strong>{session.user.name}</strong> ({session.user.email}) — rol{' '}
          {session.user.role}
        </p>
        <button type="button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </main>
    )
  }

  if (view === 'login') {
    return (
      <AuthLayout
        title="Welcome Back!"
        subtitle={
          <>
            ¿No tenés cuenta?{' '}
            <button type="button" className="link" onClick={() => setView('register')}>
              Creá una nueva
            </button>{' '}
            ahora, es gratis y toma menos de un minuto.
          </>
        }
      >
        <LoginForm onSuccess={handleAuthSuccess} />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle={
        <>
          ¿Ya tenés cuenta?{' '}
          <button type="button" className="link" onClick={() => setView('login')}>
            Iniciá sesión
          </button>
        </>
      }
    >
      <RegisterForm onSuccess={handleAuthSuccess} />
    </AuthLayout>
  )
}

export default App
