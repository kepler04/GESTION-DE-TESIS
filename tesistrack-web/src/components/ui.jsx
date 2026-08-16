import { Link } from 'react-router-dom'

export function Card({ titulo, accion, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(titulo || accion) && (
        <header className="card__head">
          <h2>{titulo}</h2>
          {accion}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  )
}

export function Vacio({ children, cta }) {
  return (
    <div className="vacio">
      <p>{children}</p>
      {cta}
    </div>
  )
}

export function Cargando({ children = 'Cargando…' }) {
  return <p className="estado-carga">{children}</p>
}

export function ErrorMsg({ children }) {
  return (
    <p className="alerta" role="alert">
      {children}
    </p>
  )
}

export function PageHead({ titulo, descripcion, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </div>
      {children && <div className="page-head__acciones">{children}</div>}
    </div>
  )
}

export function SelectorProyecto({ proyectos, activoId, onChange }) {
  if (proyectos.length <= 1) return null
  return (
    <label className="selector-proyecto">
      <span>Proyecto</span>
      <select value={activoId ?? ''} onChange={(e) => onChange(Number(e.target.value))}>
        {proyectos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.titulo}
          </option>
        ))}
      </select>
    </label>
  )
}

export function SinProyecto({ esEstudiante }) {
  return (
    <Vacio
      cta={
        esEstudiante ? (
          <Link className="btn btn--primario" to="/proyectos">
            Crear mi proyecto
          </Link>
        ) : null
      }
    >
      {esEstudiante
        ? 'Todavía no tenés un proyecto de tesis. Creá uno para empezar a cargar hitos y entregas.'
        : 'Todavía no tenés proyectos asignados. El estudiante te elige como asesor al crear su proyecto.'}
    </Vacio>
  )
}

export function fecha(valor) {
  if (!valor) return '—'
  return new Date(valor).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
