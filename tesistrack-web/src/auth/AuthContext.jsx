import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, setUnauthorizedHandler } from '../api/client'

const AuthContext = createContext(null)

function leerSesion() {
  const token = localStorage.getItem('token')
  const userRaw = localStorage.getItem('user')
  if (!token || !userRaw) return null
  try {
    return { token, user: JSON.parse(userRaw) }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(leerSesion)
  // Hasta que no revalidemos el token guardado no sabemos si la sesión sirve.
  const [verificando, setVerificando] = useState(() => leerSesion() !== null)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setSession(null)
  }, [])

  const login = useCallback(({ token, user }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setSession({ token, user })
  }, [])

  // El cliente HTTP cierra sesión solo si el backend devuelve 401.
  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  // Un token guardado puede estar vencido: lo contrastamos contra /auth/me al
  // arrancar, en vez de confiar en lo que haya en localStorage.
  useEffect(() => {
    if (!session) {
      setVerificando(false)
      return
    }
    let cancelado = false
    api('/api/auth/me')
      .then((user) => {
        if (cancelado) return
        localStorage.setItem('user', JSON.stringify(user))
        setSession((actual) => (actual ? { ...actual, user } : actual))
      })
      .catch(() => {
        if (!cancelado) logout()
      })
      .finally(() => {
        if (!cancelado) setVerificando(false)
      })
    return () => {
      cancelado = true
    }
    // Solo al montar: revalida el token que venía de localStorage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, verificando, login, logout }),
    [session, verificando, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
