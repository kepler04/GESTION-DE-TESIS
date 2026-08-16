import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import { useAuth } from '../auth/AuthContext'
import '../styles/app.css'

/**
 * El menú se arma según el rol. El coordinador solo ve lo que puede consultar:
 * su alcance es lectura global, sin escritura (Decisión 8).
 */
function menuPara(rol) {
  const comun = [
    { to: '/', label: 'Dashboard', icono: '▦', end: true },
    { to: '/proyectos', label: rol === 'ESTUDIANTE' ? 'Mi proyecto' : 'Proyectos', icono: '◈' },
    { to: '/hitos', label: 'Hitos', icono: '◎' },
    { to: '/entregas', label: 'Entregas', icono: '↑' },
    { to: '/observaciones', label: 'Observaciones', icono: '!' },
    { to: '/asesorias', label: 'Asesorías', icono: '☷' },
    { to: '/tareas', label: 'Tareas', icono: '✓' },
  ]
  if (rol === 'COORDINADOR') {
    return comun.filter((i) => ['/', '/proyectos', '/hitos'].includes(i.to))
  }
  return comun
}

const NOMBRE_ROL = {
  ESTUDIANTE: 'Estudiante',
  ASESOR: 'Asesor',
  COORDINADOR: 'Coordinador',
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [abierto, setAbierto] = useState(false)

  const iniciales = (user?.name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  return (
    <div className={`shell ${abierto ? 'shell--menu-abierto' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar__marca">
          <BrandLogo variant="inline" />
        </div>

        <p className="sidebar__seccion">Menú</p>
        <nav className="sidebar__nav">
          {menuPara(user?.role).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
              onClick={() => setAbierto(false)}
            >
              <span className="sidebar__icono" aria-hidden="true">
                {item.icono}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__pie">
          <span>TesisTrack</span>
        </div>
      </aside>

      <div className="contenido">
        <header className="topbar">
          <button
            type="button"
            className="topbar__hamburguesa"
            onClick={() => setAbierto((v) => !v)}
            aria-label="Abrir menú"
          >
            ☰
          </button>

          <div className="topbar__usuario">
            <div className="topbar__datos">
              <strong>{user?.name}</strong>
              <span>{NOMBRE_ROL[user?.role] ?? user?.role}</span>
            </div>
            <div className="topbar__avatar" aria-hidden="true">
              {iniciales}
            </div>
            <button type="button" className="btn btn--sutil" onClick={logout}>
              Salir
            </button>
          </div>
        </header>

        <main className="pagina">
          <Outlet />
        </main>
      </div>

      {abierto && (
        <button
          type="button"
          className="shell__velo"
          aria-label="Cerrar menú"
          onClick={() => setAbierto(false)}
        />
      )}
    </div>
  )
}
