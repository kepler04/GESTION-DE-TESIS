import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import Dispersion from '../components/Dispersion'
import useEnVista from '../hooks/useEnVista'
import '../styles/landing.css'

/** Cadena de trazabilidad de Reglas de negocio.md, con el ejemplo del vault. */
const HILO = [
  { paso: 'Asesoría', detalle: 'Revisión de antecedentes · 10 ago' },
  { paso: 'Acuerdo', detalle: 'Ampliar antecedentes internacionales' },
  { paso: 'Tarea', detalle: 'Agregar 5 antecedentes · vence 15 sep' },
  { paso: 'Entrega', detalle: 'Marco teorico_v2.pdf' },
  { paso: 'Observación', detalle: 'Falta la cita de Hernández (2021)' },
  { paso: 'Nueva entrega', detalle: 'Marco teorico_v3.pdf' },
]

const ROLES = [
  {
    rol: 'Estudiante',
    pregunta: '¿En qué estado está mi tesis y qué tengo que hacer ahora?',
    puntos: ['Ves tus hitos y sus fechas', 'Subís cada versión', 'Leés las observaciones y qué falta corregir'],
  },
  {
    rol: 'Asesor',
    pregunta: '¿Qué avanzó, qué le falta y qué observaciones siguen pendientes?',
    puntos: ['Definís los hitos de cada tesis', 'Registrás asesorías, acuerdos y tareas', 'Observás cada entrega y cerrás los hitos'],
  },
  {
    rol: 'Coordinador',
    pregunta: '¿Cómo vienen todos los proyectos?',
    puntos: ['Consultás cualquier proyecto', 'Ves el cumplimiento de los hitos', 'Solo lectura: no toca el trabajo de nadie'],
  },
]

const NO_ES = [
  'Un sistema de matrícula',
  'Un gestor administrativo universitario',
  'Un sistema de pagos',
  'Un detector de plagio',
  'Una IA que redacte tu tesis',
  'Un juez de la calidad académica',
]

function Seccion({ className = '', children }) {
  const [ref, visto] = useEnVista()
  return (
    <section ref={ref} className={`seccion ${className} ${visto ? 'is-visible' : ''}`}>
      {children}
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing__nav">
        <div className="landing__nav-marca">
          <BrandLogo variant="inline" />
        </div>
        <nav>
          <Link to="/login" className="lbtn lbtn--fantasma">
            Entrar
          </Link>
          <Link to="/registro" className="lbtn lbtn--oro">
            Crear cuenta
          </Link>
        </nav>
      </header>

      {/* ---------------- hero ---------------- */}
      <section className="hero-landing">
        <div className="hero-landing__texto">
          <p className="eyebrow">Seguimiento de asesorías de tesis</p>
          <h1>
            La información de tu tesis existe.
            <br />
            El problema es <em>dónde está</em>.
          </h1>
          <p className="plomo">
            Los acuerdos quedaron en WhatsApp, las observaciones en el correo y las versiones en tu
            carpeta de descargas. TesisTrack las junta en un solo lugar y te muestra en qué vas.
          </p>
          <div className="hero-landing__acciones">
            <Link to="/registro" className="lbtn lbtn--oro lbtn--grande">
              Empezar
            </Link>
            <Link to="/login" className="lbtn lbtn--fantasma lbtn--grande">
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <Dispersion />
      </section>

      {/* ---------------- el hilo ---------------- */}
      <Seccion className="seccion--hilo">
        <div className="seccion__head">
          <p className="eyebrow eyebrow--oscuro">Trazabilidad</p>
          <h2>De lo que se dijo en una reunión a la versión que lo corrige.</h2>
          <p className="seccion__bajada">
            TesisTrack no guarda archivos sueltos: guarda el proceso que ocurre alrededor de esos
            archivos. Cada paso queda enganchado al anterior, así que siempre se puede reconstruir
            por qué una entrega cambió.
          </p>
        </div>

        <ol className="hilo">
          {HILO.map((h, i) => (
            <li key={h.paso} style={{ '--i': i }}>
              <span className="hilo__punto" aria-hidden="true" />
              <div>
                <strong>{h.paso}</strong>
                <span>{h.detalle}</span>
              </div>
            </li>
          ))}
        </ol>
      </Seccion>

      {/* ---------------- roles ---------------- */}
      <Seccion className="seccion--roles">
        <div className="seccion__head">
          <p className="eyebrow eyebrow--oscuro">Quién lo usa</p>
          <h2>Cada uno entra a resolver su propia pregunta.</h2>
        </div>

        <div className="roles">
          {ROLES.map((r, i) => (
            <article key={r.rol} className="rol" style={{ '--i': i }}>
              <h3>{r.rol}</h3>
              <p className="rol__pregunta">{r.pregunta}</p>
              <ul>
                {r.puntos.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Seccion>

      {/* ---------------- lo que no es ---------------- */}
      <Seccion className="seccion--limites">
        <div className="seccion__head">
          <p className="eyebrow">Alcance</p>
          <h2>Para que sea simple, decidimos qué no hacer.</h2>
          <p className="seccion__bajada">
            Una herramienta que intenta hacer todo termina sin servir para nada. TesisTrack hace una
            sola cosa: seguirle el rastro a la asesoría.
          </p>
        </div>

        <ul className="limites">
          {NO_ES.map((n, i) => (
            <li key={n} style={{ '--i': i }}>
              <span aria-hidden="true">✕</span>
              {n}
            </li>
          ))}
        </ul>
      </Seccion>

      {/* ---------------- cierre ---------------- */}
      <section className="cierre">
        <h2>Empezá por tu próximo hito.</h2>
        <p>Creás tu proyecto, elegís asesor y el resto queda registrado solo.</p>
        <Link to="/registro" className="lbtn lbtn--oro lbtn--grande">
          Crear cuenta
        </Link>
      </section>

      <footer className="landing__pie">
        <span>© {new Date().getFullYear()} TesisTrack</span>
        <span>Plataforma web para el seguimiento de asesorías de tesis</span>
      </footer>
    </div>
  )
}
