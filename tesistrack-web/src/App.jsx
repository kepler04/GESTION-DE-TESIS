import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import AppLayout from './layouts/AppLayout'
import AsesoradosPage from './pages/AsesoradosPage'
import EspacioPage from './pages/EspacioPage'
import AsesoriasPage from './pages/AsesoriasPage'
import TareasPage from './pages/TareasPage'
import DashboardPage from './pages/DashboardPage'
import EntregasPage from './pages/EntregasPage'
import HitosPage from './pages/HitosPage'
import LandingPage from './pages/LandingPage'
import ObservacionesPage from './pages/ObservacionesPage'
import PrivacidadPage from './pages/PrivacidadPage'
import ProyectosPage from './pages/ProyectosPage'
import { LoginPage, RegisterPage } from './pages/LoginPage'

/** Solo deja pasar con sesión válida; espera a que se revalide el token guardado. */
function RutaPrivada() {
  const { session, verificando } = useAuth()
  if (verificando) return <div className="arranque">Cargando…</div>
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

/** Si ya hay sesión, login y registro redirigen al panel. */
function RutaPublica() {
  const { session, verificando } = useAuth()
  if (verificando) return <div className="arranque">Cargando…</div>
  if (session) return <Navigate to="/panel" replace />
  return <Outlet />
}

/** La landing es para quien todavía no entró: con sesión abierta va derecho al panel. */
function Portada() {
  const { session, verificando } = useAuth()
  if (verificando) return <div className="arranque">Cargando…</div>
  if (session) return <Navigate to="/panel" replace />
  return <LandingPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Portada />} />

          {/* Fuera de RutaPublica a propósito: la política tiene que poder
              leerse con sesión abierta y sin ella. */}
          <Route path="/privacidad" element={<PrivacidadPage />} />

          <Route element={<RutaPublica />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
          </Route>

          <Route element={<RutaPrivada />}>
            <Route element={<AppLayout />}>
              <Route path="/panel" element={<DashboardPage />} />
              <Route path="/proyectos" element={<ProyectosPage />} />
              <Route path="/asesorados" element={<AsesoradosPage />} />
              <Route path="/espacios/:areaId" element={<EspacioPage />} />
              <Route path="/hitos" element={<HitosPage />} />
              <Route path="/entregas" element={<EntregasPage />} />
              <Route path="/observaciones" element={<ObservacionesPage />} />
              <Route path="/asesorias" element={<AsesoriasPage />} />
              <Route path="/tareas" element={<TareasPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
