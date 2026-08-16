/**
 * Anillo de avance: una sola serie, así que no lleva leyenda — el valor va
 * escrito en el centro y el título lo nombra.
 */
export default function ProgressRing({ valor, total, etiqueta }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0
  const r = 34
  const circunferencia = 2 * Math.PI * r
  const avance = (pct / 100) * circunferencia

  return (
    <div className="ring">
      <svg viewBox="0 0 88 88" role="img" aria-label={`${etiqueta}: ${pct}%`}>
        <circle cx="44" cy="44" r={r} className="ring__pista" />
        <circle
          cx="44"
          cy="44"
          r={r}
          className="ring__valor"
          strokeDasharray={`${avance} ${circunferencia - avance}`}
          transform="rotate(-90 44 44)"
        />
        <text x="44" y="49" textAnchor="middle" className="ring__texto">
          {pct}%
        </text>
      </svg>
      <div className="ring__pie">
        <strong>
          {valor}/{total}
        </strong>
        <span>{etiqueta}</span>
      </div>
    </div>
  )
}
