import { useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import EstadoBadge from './EstadoBadge'
import HeroConstelacion from './HeroConstelacion'
import '../styles/auth.css'

/**
 * Los hitos son los del ejemplo de Hitos.md, con los estados que tendría una
 * tesis a mitad de camino. La línea de estado usa el mismo badge que el panel:
 * quien entra ya ve el vocabulario que va a encontrar adentro.
 */
const HITOS = [
  { nombre: 'Planteamiento del problema', estado: 'COMPLETADO' },
  { nombre: 'Marco teórico', estado: 'OBSERVADO' },
  { nombre: 'Metodología', estado: 'EN_PROCESO' },
  { nombre: 'Resultados y discusión', estado: 'PENDIENTE' },
  { nombre: 'Sustentación', estado: 'PENDIENTE' },
]

function CapaBirrete() {
  return (
    <svg className="hero__birrete" viewBox="0 0 200 150" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="capPlata" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fdfdfe" />
          <stop offset="35%" stopColor="#c9ccd4" />
          <stop offset="60%" stopColor="#8f949f" />
          <stop offset="100%" stopColor="#dfe2e8" />
        </linearGradient>
        <linearGradient id="capPlataOscura" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9ba0ab" />
          <stop offset="100%" stopColor="#5c616c" />
        </linearGradient>
      </defs>
      <path d="M66 62 L66 92 C66 106 134 106 134 92 L134 62 Z" fill="url(#capPlataOscura)" />
      <path d="M100 12 L192 48 L100 84 L8 48 Z" fill="url(#capPlata)" />
      <circle cx="100" cy="49" r="6" fill="url(#capPlataOscura)" />
      <path
        d="M100 49 C72 56 46 51 39 58 L39 92"
        fill="none"
        stroke="url(#capPlataOscura)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M33 90 L45 90 L41 124 L37 124 Z" fill="url(#capPlataOscura)" />
    </svg>
  )
}

export default function AuthLayout({ title, subtitle, children }) {
  const [activo, setActivo] = useState(1)
  const hito = HITOS[activo] ?? HITOS[0]

  return (
    <div className="auth-shell">
      <aside className="auth-hero">
        <HeroConstelacion onHito={setActivo} />

        <div className="auth-hero__content">
          <CapaBirrete />

          <p className="hero__eyebrow">Seguimiento de asesorías de tesis</p>

          <h1>
            El estado de tu tesis,
            <br />
            siempre a la vista.
          </h1>

          <p className="hero__texto">
            Hitos, entregas, observaciones y los acuerdos de cada asesoría, en un solo lugar.
            Sabés en qué vas y qué sigue.
          </p>

          {/* Ilustrativo: acompaña al pulso del fondo, no son datos de nadie. */}
          <div className="hero__estado" aria-hidden="true">
            <span className="hero__estado-hito">{hito.nombre}</span>
            <EstadoBadge estado={hito.estado} />
          </div>
        </div>

        <p className="auth-hero__footer">
          © {new Date().getFullYear()} TesisTrack. Todos los derechos reservados.
        </p>
      </aside>

      <main className="auth-panel">
        <div className="auth-panel__inner">
          {/* Salida sin compromiso: quien todavía está decidiendo puede volver a
              leer la portada sin tener que usar el botón atrás del navegador. */}
          <Link className="auth-volver" to="/">
            <span className="auth-volver__flecha" aria-hidden="true">
              ←
            </span>
            Volver al inicio
          </Link>

          <div className="auth-card">
            <Link className="brand-logo" to="/" aria-label="TesisTrack — ir al inicio">
              <BrandLogo variant="stacked" />
            </Link>

            <h2>{title}</h2>
            {subtitle && <div className="auth-subtitle">{subtitle}</div>}

            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
