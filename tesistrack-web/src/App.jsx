import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import AppLayout from './layouts/AppLayout'
import AsesoradosPage from './pages/AsesoradosPage'
import ClasePage from './pages/ClasePage'
import AsesoriasPage from './pages/AsesoriasPage'
import TareasPage from './pages/TareasPage'
import DashboardPage from './pages/DashboardPage'
import EntregasPage from './pages/EntregasPage'
import HitosPage from './pages/HitosPage'
import LandingPage from './pages/LandingPage'
import MiClasePage from './pages/MiClasePage'
import MiTesisPage from './pages/MiTesisPage'
import MensajesPage from './pages/MensajesPage'
import MisClasesPage from './pages/MisClasesPage'
import ObservacionesPage from './pages/ObservacionesPage'
import PrivacidadPage from './pages/PrivacidadPage'
import PerfilPage from './pages/PerfilPage'
import TesisPage from './pages/TesisPage'
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

/**
 * Las rutas viejas siguen llevando a algún lado: alguien puede tener guardado un
 * enlace de antes de que el vocabulario cambiara (`/proyectos`, `/espacios/3`…). Cada
 * una redirige a su equivalente, que según el rol puede ser otra pantalla.
 */
function RedirigirProyectos() {
  const { user } = useAuth()
  const destino =
    user?.role === 'ASESOR' ? '/clases' : user?.role === 'COORDINADOR' ? '/tesis' : '/mi-tesis'
  return <Navigate to={destino} replace />
}

/**
 * Hitos, Entregas, Observaciones, Tareas y Asesorías son pestañas de Mi tesis para el
 * estudiante (Decisión 32). Sus rutas sueltas siguen andando: lo llevan a la pestaña,
 * con los mismos parámetros (`/entregas?hito=4` → `/mi-tesis?pestana=entregas&hito=4`).
 * El profesor y el coordinador las siguen viendo como pantallas.
 */
function SeguimientoDe({ pestana, children }) {
  const { user } = useAuth()
  const { search } = useLocation()
  if (user?.role !== 'ESTUDIANTE') return children
  const resto = new URLSearchParams(search)
  resto.delete('pestana')
  const extra = resto.toString()
  return <Navigate to={`/mi-tesis?pestana=${pestana}${extra ? `&${extra}` : ''}`} replace />
}

function RedirigirEspacio() {
  const { areaId } = useParams()
  return <Navigate to={`/clases/${areaId}`} replace />
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
              <Route path="/clases" element={<MisClasesPage />} />
              <Route path="/clases/:areaId" element={<ClasePage />} />
              <Route path="/clase" element={<MiClasePage />} />
              <Route path="/mi-tesis" element={<MiTesisPage />} />
              <Route path="/tesis" element={<TesisPage />} />
              <Route path="/asesorias-privadas" element={<AsesoradosPage />} />
              <Route path="/perfil" element={<PerfilPage />} />
              <Route path="/mensajes" element={<MensajesPage />} />
              {/* Los nombres de antes: ver RedirigirProyectos. */}
              <Route path="/proyectos" element={<RedirigirProyectos />} />
              <Route path="/asesorados" element={<Navigate to="/asesorias-privadas" replace />} />
              <Route path="/espacio" element={<Navigate to="/clase" replace />} />
              <Route path="/espacios/:areaId" element={<RedirigirEspacio />} />
              <Route path="/hitos" element={<SeguimientoDe pestana="hitos"><HitosPage /></SeguimientoDe>} />
              <Route path="/entregas" element={<SeguimientoDe pestana="entregas"><EntregasPage /></SeguimientoDe>} />
              <Route
                path="/observaciones"
                element={<SeguimientoDe pestana="observaciones"><ObservacionesPage /></SeguimientoDe>}
              />
              <Route path="/asesorias" element={<SeguimientoDe pestana="asesorias"><AsesoriasPage /></SeguimientoDe>} />
              <Route path="/tareas" element={<SeguimientoDe pestana="tareas"><TareasPage /></SeguimientoDe>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
