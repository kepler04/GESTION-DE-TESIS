import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Icono from './Icono'

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

/**
 * Estado vacío: un ícono neutro, la explicación y, si hay, la salida (un botón).
 * Nunca un "no hay datos" seco: dice qué falta y qué hacer.
 */
export function Vacio({ children, cta, icono = 'carpeta', titulo }) {
  return (
    <div className="vacio">
      <span className="vacio__icono">
        <Icono nombre={icono} />
      </span>
      {titulo && <p className="vacio__titulo">{titulo}</p>}
      <p>{children}</p>
      {cta}
    </div>
  )
}

/**
 * Una sección de página con su título fuera de tarjeta (Próximas reuniones, Mis
 * clases): el contenido son varias tarjetas, no una sola.
 */
export function Seccion({ titulo, accion, children, className = '' }) {
  return (
    <section className={`panel-seccion ${className}`}>
      <header className="panel-seccion__head">
        <h2>{titulo}</h2>
        {accion}
      </header>
      {children}
    </section>
  )
}

/**
 * El código de invitación de una clase, con su botón para copiarlo. Va en
 * monoespaciada y con borde punteado: se lee como algo para pasar, no para editar.
 */
export function ChipCodigo({ codigo, grande = false }) {
  const [copiado, setCopiado] = useState(false)
  return (
    <span className={`chip-codigo ${grande ? 'chip-codigo--grande' : ''}`}>
      <code>{codigo}</code>
      <button
        type="button"
        className="chip-codigo__copiar"
        onClick={() => {
          navigator.clipboard?.writeText(codigo)
          setCopiado(true)
          setTimeout(() => setCopiado(false), 1800)
        }}
        aria-label={copiado ? 'Código copiado' : `Copiar el código ${codigo}`}
      >
        {copiado ? <span className="chip-codigo__ok">✓ Copiado</span> : <Icono nombre="copiar" />}
      </button>
    </span>
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

/**
 * Elige sobre qué tesis trabaja la pantalla. Al estudiante le dice "Tesis"; al
 * profesor, que elige entre los grupos de sus clases, "Grupo" (y cada opción lleva
 * quiénes son, porque dos grupos pueden tener el mismo tema).
 */
export function SelectorProyecto({ proyectos, activoId, onChange }) {
  const { user } = useAuth()
  if (proyectos.length <= 1) return null
  const esAsesor = user?.role === 'ASESOR'
  return (
    <label className="selector-proyecto">
      <span>{esAsesor ? 'Grupo' : 'Tesis'}</span>
      <select value={activoId ?? ''} onChange={(e) => onChange(Number(e.target.value))}>
        {proyectos.map((p) => (
          <option key={p.id} value={p.id}>
            {esAsesor
              ? `${nombres(p.estudiantes)} — ${p.titulo || 'Tema por definir'}`
              : p.titulo || 'Tema por definir'}
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
        Todavía no tenés una tesis. Al crearla podés pegar el código que te pasó tu profesor y
        sumarte a su clase.
      </Vacio>
    )
  }

  if (rol === 'ASESOR') {
    return (
      <Vacio
        cta={
          <Link className="btn btn--primario" to="/clases">
            Ir a mis clases
          </Link>
        }
      >
        Todavía no tenés grupos. El código de invitación de tu clase está en Mis clases:
        pasáselo a tus alumnos y sus tesis aparecen acá.
      </Vacio>
    )
  }

  return <Vacio>Todavía no hay tesis para consultar.</Vacio>
}

/**
 * Nombres de los integrantes de una tesis, separados por coma.
 *
 * Una tesis puede ser grupal, así que ninguna pantalla asume una sola persona.
 */
export function nombres(estudiantes) {
  if (!estudiantes || estudiantes.length === 0) return '—'
  return estudiantes.map((e) => e.name).join(', ')
}

/**
 * Una fecha para leer. Las fechas sin hora (`2026-10-03`, las fechas límite) se leen
 * como día local: `new Date('2026-10-03')` es medianoche UTC, que en Lima todavía es
 * el día anterior, y la fecha límite se mostraba un día antes.
 */
export function fecha(valor) {
  if (!valor) return '—'
  const soloDia = typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)
  return new Date(soloDia ? `${valor}T00:00:00` : valor).toLocaleDateString('es', {
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
