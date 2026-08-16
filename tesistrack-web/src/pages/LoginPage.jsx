import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle={
        <>
          ¿No tenés cuenta?{' '}
          <button type="button" className="link" onClick={() => navigate('/registro')}>
            Creá una nueva
          </button>{' '}
          ahora, es gratis y toma menos de un minuto.
        </>
      }
    >
      <LoginForm
        onSuccess={(data) => {
          login(data)
          navigate('/panel', { replace: true })
        }}
      />
    </AuthLayout>
  )
}

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle={
        <>
          ¿Ya tenés cuenta?{' '}
          <button type="button" className="link" onClick={() => navigate('/login')}>
            Iniciá sesión
          </button>
        </>
      }
    >
      <RegisterForm
        onSuccess={(data) => {
          login(data)
          navigate('/panel', { replace: true })
        }}
      />
    </AuthLayout>
  )
}
