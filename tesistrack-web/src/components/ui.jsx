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

/**
 * Estado vacío de las pantallas que necesitan un proyecto seleccionado.
 *
 * Toda variante lleva una salida: sin botón, seis pantallas le decían al asesor
 * recién llegado que pasara "el código de tu carpeta" —una carpeta que todavía no
 * existía— y lo dejaban ahí.
 */
export function SinProyecto({ rol }) {
  if (rol === 'ESTUDIANTE') {
    return (
      <Vacio
        cta={
          <Link className="btn btn--primario" to="/panel">
            Empezar
          </Link>
        }
      >
        Todavía no tenés un proyecto de tesis. Al crearlo podés pegar el código que te pasó tu
        asesor y sumarte a su carpeta.
      </Vacio>
    )
  }

  if (rol === 'ASESOR') {
    return (
      <Vacio
        cta={
          <Link className="btn btn--primario" to="/proyectos">
            Ir a mis espacios
          </Link>
        }
      >
        Todavía no tenés asesorados. Tu código de invitación está en Mis espacios: pasáselo a tus
        estudiantes y sus tesis aparecen acá.
      </Vacio>
    )
  }

  return <Vacio>Todavía no hay proyectos para consultar.</Vacio>
}

export function fecha(valor) {
  if (!valor) return '—'
  return new Date(valor).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Para eventos donde dos registros del mismo día se distinguen por la hora (v1 y v2, asesorías). */
export function fechaHora(valor) {
  if (!valor) return '—'
  return new Date(valor).toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
