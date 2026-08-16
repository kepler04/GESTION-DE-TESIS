import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import HitosPage from './pages/HitosPage'
import PendientePage from './pages/PendientePage'
import ProyectosPage from './pages/ProyectosPage'
import { LoginPage, RegisterPage } from './pages/LoginPage'

/** Solo deja pasar con sesión válida; espera a que se revalide el token guardado. */
function RutaPrivada() {
  const { session, verificando } = useAuth()
  if (verificando) return <div className="arranque">Cargando…</div>
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

/** Si ya hay sesión, login y registro redirigen al dashboard. */
function RutaPublica() {
  const { session, verificando } = useAuth()
  if (verificando) return <div className="arranque">Cargando…</div>
  if (session) return <Navigate to="/" replace />
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<RutaPublica />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
          </Route>

          <Route element={<RutaPrivada />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="/proyectos" element={<ProyectosPage />} />
              <Route path="/hitos" element={<HitosPage />} />
              <Route
                path="/entregas"
                element={
                  <PendientePage
                    titulo="Entregas"
                    descripcion="Las versiones que subís contra cada hito."
                    endpoints={['POST /api/hitos/{id}/entregas', 'GET /api/hitos/{id}/entregas']}
                  />
                }
              />
              <Route
                path="/observaciones"
                element={
                  <PendientePage
                    titulo="Observaciones"
                    descripcion="Lo que el asesor marcó sobre cada versión entregada."
                    endpoints={[
                      'POST /api/entregas/{id}/observaciones',
                      'GET /api/entregas/{id}/observaciones',
                      'PATCH /api/observaciones/{id}/estado',
                    ]}
                  />
                }
              />
              <Route
                path="/asesorias"
                element={
                  <PendientePage
                    titulo="Asesorías"
                    descripcion="Reuniones registradas y los acuerdos que salieron de cada una."
                    endpoints={[
                      'POST /api/proyectos/{id}/asesorias',
                      'GET /api/proyectos/{id}/asesorias',
                      'POST /api/asesorias/{id}/acuerdos',
                    ]}
                  />
                }
              />
              <Route
                path="/tareas"
                element={
                  <PendientePage
                    titulo="Tareas"
                    descripcion="Lo que quedó por hacer, con responsable y fecha límite."
                    endpoints={[
                      'POST /api/proyectos/{id}/tareas',
                      'GET /api/proyectos/{id}/tareas?completada=false',
                      'PATCH /api/tareas/{id}/completar',
                    ]}
                  />
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
