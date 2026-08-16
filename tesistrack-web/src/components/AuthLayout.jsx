import BrandLogo from './BrandLogo'
import '../styles/auth.css'

function HeroCap() {
  return (
    <svg className="auth-hero__cap" viewBox="0 0 200 150" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="capSilver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fdfdfe" />
          <stop offset="35%" stopColor="#c9ccd4" />
          <stop offset="60%" stopColor="#8f949f" />
          <stop offset="100%" stopColor="#dfe2e8" />
        </linearGradient>
        <linearGradient id="capSilverDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9ba0ab" />
          <stop offset="100%" stopColor="#5c616c" />
        </linearGradient>
      </defs>

      <path d="M66 62 L66 92 C66 106 134 106 134 92 L134 62 Z" fill="url(#capSilverDark)" />
      <path d="M100 12 L192 48 L100 84 L8 48 Z" fill="url(#capSilver)" />
      <circle cx="100" cy="49" r="6" fill="url(#capSilverDark)" />
      <path
        d="M100 49 C72 56 46 51 39 58 L39 92"
        fill="none"
        stroke="url(#capSilverDark)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M33 90 L45 90 L41 124 L37 124 Z" fill="url(#capSilverDark)" />
    </svg>
  )
}

function HeroBackdrop() {
  return (
    <svg className="auth-hero__bg" viewBox="0 0 600 800" aria-hidden="true" focusable="false">
      <g className="auth-hero__lines" stroke="currentColor" strokeWidth="0.9" fill="none">
        <path d="M40 120 L180 40 L340 90 L500 30" />
        <path d="M180 40 L220 220 L80 320" />
        <path d="M340 90 L420 260 L560 200" />
        <path d="M220 220 L420 260 L380 460" />
        <path d="M80 320 L60 520 L240 600" />
        <path d="M380 460 L560 440 L520 640" />
        <path d="M240 600 L380 460" />
        <path d="M240 600 L200 760" />
        <path d="M420 260 L240 600" />
        <path d="M60 520 L380 460" />
        <path d="M500 30 L560 200" />
        <path d="M40 120 L80 320" />
        <path d="M520 640 L200 760" />
      </g>
      <g className="auth-hero__dots" fill="currentColor">
        <circle cx="40" cy="120" r="4.5" />
        <circle cx="180" cy="40" r="4.5" />
        <circle cx="340" cy="90" r="4.5" />
        <circle cx="500" cy="30" r="4.5" />
        <circle cx="220" cy="220" r="4.5" />
        <circle cx="80" cy="320" r="4.5" />
        <circle cx="420" cy="260" r="4.5" />
        <circle cx="560" cy="200" r="4.5" />
        <circle cx="380" cy="460" r="4.5" />
        <circle cx="60" cy="520" r="4.5" />
        <circle cx="240" cy="600" r="4.5" />
        <circle cx="560" cy="440" r="4.5" />
        <circle cx="520" cy="640" r="4.5" />
        <circle cx="200" cy="760" r="4.5" />
      </g>
    </svg>
  )
}

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-hero">
        <HeroBackdrop />

        <div className="auth-hero__content">
          <HeroCap />
          <h1>
            Hola,
            <br />
            Tesis Track! <span aria-hidden="true">👋</span>
          </h1>
          <p>
            Simplificá tu camino académico. Gestioná avances de tesis, coordiná revisiones y no
            pierdas de vista los hitos. Enfocate en tu investigación, nosotros nos encargamos del
            seguimiento.
          </p>
        </div>

        <p className="auth-hero__footer">
          © {new Date().getFullYear()} TesisTrack. Todos los derechos reservados.
        </p>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">
          <div className="brand-logo">
            <BrandLogo />
            <span className="brand-logo__word">Tesis Track</span>
          </div>

          <h2>{title}</h2>
          {subtitle && <div className="auth-subtitle">{subtitle}</div>}

          {children}
        </div>
      </main>
    </div>
  )
}
