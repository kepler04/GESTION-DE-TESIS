import { useState } from 'react'

/**
 * Marca de TesisTrack: birrete sobre una S serif.
 *
 * Se usa como respaldo dibujado en SVG. Si colocás el archivo real en
 * `public/logo.png` (o .svg), este componente lo toma automáticamente y
 * descarta el dibujo — no hace falta tocar código.
 */
function BrandMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 200 250" role="img" aria-label="TesisTrack">
      <text
        x="100"
        y="228"
        textAnchor="middle"
        fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif"
        fontSize="215"
        fontWeight="600"
        fill="currentColor"
      >
        S
      </text>

      {/* cuerpo del birrete (queda detrás del tablero) */}
      <path d="M66 72 L66 106 C66 120 134 120 134 106 L134 72 Z" fill="currentColor" />

      {/* tablero */}
      <path d="M100 16 L196 56 L100 96 L4 56 Z" fill="currentColor" />

      {/* cordón y borla */}
      <circle cx="100" cy="58" r="7" fill="currentColor" />
      <path
        d="M100 58 C70 66 42 60 34 68 L34 104"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path d="M27 102 L41 102 L37 140 L31 140 Z" fill="currentColor" />
    </svg>
  )
}

export default function BrandLogo() {
  const [useFallback, setUseFallback] = useState(false)

  if (useFallback) {
    return <BrandMark className="brand-logo__mark" />
  }

  return (
    <img
      className="brand-logo__img"
      src="/logo.png"
      alt="TesisTrack"
      onError={() => setUseFallback(true)}
    />
  )
}
