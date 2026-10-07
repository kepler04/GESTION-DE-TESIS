/**
 * Cómo vienen los grupos de una clase, repartidos en los cuatro estados del
 * semáforo (Decisión 26).
 *
 * - `variante="barra"`: una barra repartida con el reparto escrito al lado. La barra
 *   es refuerzo; lo que se lee es el texto.
 * - `variante="chips"`: un chip por estado con su ícono, su número y su nombre.
 *
 * Los estados en cero no se muestran: "0 atrasados" es ruido.
 */
const ESTADOS = [
  { clave: 'verde', clase: 'completado', icono: '✓', uno: 'al día', varios: 'al día', barra: 'r-verde' },
  { clave: 'amarillo', clase: 'aviso', icono: '⚠', uno: 'en riesgo', varios: 'en riesgo', barra: 'r-amarillo' },
  { clave: 'rojo', clase: 'alerta', icono: '✕', uno: 'atrasado', varios: 'atrasados', barra: 'r-rojo' },
  { clave: 'sinActividad', clase: 'neutro', icono: '—', uno: 'sin empezar', varios: 'sin empezar', barra: 'r-gris' },
]

export default function RepartoSemaforo({ clase, variante = 'barra' }) {
  const presentes = ESTADOS.filter((e) => clase[e.clave] > 0)

  if (clase.grupos === 0) {
    return <p className="clase-mini__cuenta">Todavía sin grupos.</p>
  }

  if (variante === 'chips') {
    return (
      <ul className="clase-card__estado" aria-label="Cómo vienen los grupos">
        {presentes.map((e) => (
          <li key={e.clave} className={`badge badge--${e.clase}`}>
            <span className="badge__icono" aria-hidden="true">
              {e.icono}
            </span>
            {clase[e.clave]} {etiqueta(e, clase[e.clave], true)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="reparto">
      <div className="reparto__texto">
        <span>Semáforo de la clase</span>
        <span>
          {presentes.map((e) => `${clase[e.clave]} ${etiqueta(e, clase[e.clave])}`).join(' · ')}
        </span>
      </div>
      <div className="reparto__barra" aria-hidden="true">
        {presentes.map((e) => (
          <span key={e.clave} className={e.barra} style={{ flexGrow: clase[e.clave] }} />
        ))}
      </div>
    </div>
  )
}

function etiqueta(estado, n, mayuscula = false) {
  const texto = n === 1 ? estado.uno : estado.varios
  return mayuscula ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto
}
