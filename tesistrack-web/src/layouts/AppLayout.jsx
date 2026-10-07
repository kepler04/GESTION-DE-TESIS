import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { obtenerDashboardAsesor } from '../api/tesistrack'
import BienvenidaPanel from '../components/BienvenidaPanel'
import BrandLogo from '../components/BrandLogo'
import Icono from '../components/Icono'
import { useAuth } from '../auth/AuthContext'
import { MigasContext } from '../hooks/useMigas'
import { iniciales } from '../utils/formato'
import '../styles/app.css'

/**
 * El menú se arma según el rol, en dos bloques: lo propio (el panel, las clases o la
 * tesis) y el seguimiento. El coordinador solo ve lo que puede consultar: su alcance
 * es lectura global, sin escritura (Decisión 8).
 *
 * El profesor ve "Asesorías privadas" solo si dijo que las da (Decisión 24): es
 * acompañamiento uno a uno, y quien trabaja solo con clases no tiene por qué ver una
 * entrada que no usa.
 *
 * `cuenta` es un número al lado de la entrada (cuántas clases, cuántas entregas
 * esperan revisión). Es un dato, no un aviso: no se pinta de rojo.
 */
function menuPara(rol, asesoriasPrivadas, cuentas) {
  if (rol === 'COORDINADOR') {
    return [
      {
        seccion: 'Principal',
        items: [
          { to: '/panel', label: 'Dashboard', icono: 'dashboard', end: true },
          { to: '/tesis', label: 'Tesis', icono: 'tesis' },
          { to: '/hitos', label: 'Hitos', icono: 'hitos' },
        ],
      },
    ]
  }

  const principal =
    rol === 'ASESOR'
      ? [
          { to: '/panel', label: 'Dashboard', icono: 'dashboard', end: true },
          { to: '/clases', label: 'Mis clases', icono: 'clases', cuenta: cuentas.clases },
          ...(asesoriasPrivadas === true
            ? [{ to: '/asesorias-privadas', label: 'Asesorías privadas', icono: 'persona' }]
            : []),
        ]
      : [
          { to: '/panel', label: 'Dashboard', icono: 'dashboard', end: true },
          { to: '/mi-tesis', label: 'Mi tesis', icono: 'tesis' },
          // La clase del profesor al que pertenece la tesis: avisos, sesiones y materiales.
          { to: '/clase', label: 'Mi clase', icono: 'clases' },
        ]

  return [
    { seccion: rol === 'ASESOR' ? 'Principal' : 'Mi tesis', items: principal },
    {
      seccion: 'Seguimiento',
      items: [
        { to: '/hitos', label: 'Hitos', icono: 'hitos' },
        { to: '/entregas', label: 'Entregas', icono: 'entregas', cuenta: cuentas.paraRevisar },
        { to: '/observaciones', label: 'Observaciones', icono: 'observaciones' },
        { to: '/asesorias', label: 'Asesorías', icono: 'calendario' },
        { to: '/tareas', label: 'Tareas', icono: 'tareas' },
      ],
    },
  ]
}

const NOMBRE_ROL = {
  ESTUDIANTE: 'Estudiante',
  ASESOR: 'Profesor',
  COORDINADOR: 'Coordinador',
}

/** Las migas que corresponden a cada ruta, si la pantalla no pone otras. */
const MIGAS_RUTA = [
  [/^\/panel$/, 'Dashboard'],
  [/^\/clases$/, 'Mis clases'],
  [/^\/clases\//, 'Clase', { texto: 'Mis clases', a: '/clases' }],
  [/^\/clase$/, 'Mi clase'],
  [/^\/mi-tesis$/, 'Mi tesis'],
  [/^\/tesis$/, 'Tesis'],
  [/^\/asesorias-privadas$/, 'Asesorías privadas'],
  [/^\/hitos$/, 'Hitos'],
  [/^\/entregas$/, 'Entregas'],
  [/^\/observaciones$/, 'Observaciones'],
  [/^\/asesorias$/, 'Asesorías'],
  [/^\/tareas$/, 'Tareas'],
  [/^\/perfil$/, 'Mi perfil'],
]

function migasDeRuta(ruta) {
  const fila = MIGAS_RUTA.find(([re]) => re.test(ruta))
  if (!fila) return [{ texto: 'Tesis Track' }]
  const [, actual, padre] = fila
  return [{ texto: 'Tesis Track', a: '/panel' }, ...(padre ? [padre] : []), { texto: actual }]
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const [migasPantalla, setMigasPantalla] = useState(null)
  const [cuentas, setCuentas] = useState({})

  const esAsesor = user?.role === 'ASESOR'

  // Los números del menú del profesor se refrescan al cambiar de pantalla: después
  // de revisar una entrega, el contador baja sin recargar la página.
  useEffect(() => {
    if (!esAsesor) return undefined
    let cancelado = false
    obtenerDashboardAsesor()
      .then((d) => {
        if (!cancelado) setCuentas({ clases: d.clases.length, paraRevisar: d.paraRevisar.length })
      })
      // Un contador que no carga no tiene por qué tumbar el menú.
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [esAsesor, pathname])

  const migas = migasPantalla ?? migasDeRuta(pathname)

  return (
    <MigasContext.Provider value={setMigasPantalla}>
      <div className={`shell ${abierto ? 'shell--menu-abierto' : ''}`}>
        {/* Va en el layout y no en el Dashboard: el telón saluda al entrar al
            panel, sea cual sea la pantalla en la que se caiga. */}
        <BienvenidaPanel nombre={user?.name} />

        <aside className="sidebar">
          <div className="sidebar__marca">
            <BrandLogo variant="inline" />
          </div>

          <nav className="sidebar__nav" aria-label="Menú principal">
            {menuPara(user?.role, user?.asesoriasPrivadas, cuentas).map((bloque) => (
              <div key={bloque.seccion} className="sidebar__bloque">
                <p className="sidebar__seccion">{bloque.seccion}</p>
                {bloque.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
                    onClick={() => setAbierto(false)}
                  >
                    <span className="sidebar__icono" aria-hidden="true">
                      <Icono nombre={item.icono} />
                    </span>
                    {item.label}
                    {item.cuenta > 0 && (
                      <span className="sidebar__cuenta">
                        <span className="sr-only">: </span>
                        {item.cuenta}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar__usuario">
            {/* El nombre y el avatar llevan al perfil, donde viven las preferencias. */}
            <Link to="/perfil" className="sidebar__perfil" aria-label="Mi perfil" onClick={() => setAbierto(false)}>
              <span className="sidebar__avatar" aria-hidden="true">
                {iniciales(user?.name)}
              </span>
              <span className="sidebar__datos">
                <strong>{user?.name}</strong>
                <span>{NOMBRE_ROL[user?.role] ?? user?.role}</span>
              </span>
            </Link>
            <button type="button" className="sidebar__salir" onClick={logout}>
              <Icono nombre="salir" />
              Salir
            </button>
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
              <Icono nombre="menu" />
            </button>

            <nav className="migas" aria-label="Estás en">
              <ol>
                {migas.map((m, i) => {
                  const ultima = i === migas.length - 1
                  return (
                    <li key={`${m.texto}-${i}`}>
                      {ultima || !m.a ? (
                        <span className={ultima ? 'migas__actual' : undefined} aria-current={ultima ? 'page' : undefined}>
                          {m.texto}
                        </span>
                      ) : (
                        <Link to={m.a}>{m.texto}</Link>
                      )}
                    </li>
                  )
                })}
              </ol>
            </nav>
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
    </MigasContext.Provider>
  )
}
