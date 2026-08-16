import { useState } from 'react'
import '../styles/brand.css'

/**
 * Marca de TesisTrack.
 *
 * Toma `public/logo.png` si existe. Como el logo real ya trae el texto
 * "TESIS TRACK" integrado, cuando se carga la imagen no se dibuja el wordmark
 * aparte. Si el archivo no está, cae a una marca provisional en SVG.
 *
 * variant: 'stacked' (tarjeta de login) | 'inline' (barra lateral)
 */
function MarcaProvisional({ variant }) {
  return (
    <span className={`brand-fallback brand-fallback--${variant}`}>
      <svg viewBox="0 0 120 96" aria-hidden="true">
        {/* birrete */}
        <path d="M60 6 L116 28 L60 50 L4 28 Z" fill="currentColor" />
        <path d="M40 38 L40 58 C40 70 80 70 80 58 L80 38 Z" fill="currentColor" />
        <path d="M108 33 L108 62" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <circle cx="108" cy="66" r="5" fill="currentColor" />
        {/* monograma */}
        <text
          x="60"
          y="94"
          textAnchor="middle"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="34"
          fontWeight="700"
          fill="currentColor"
        >
          TK
        </text>
      </svg>
      <span className="brand-fallback__word">Tesis Track</span>
    </span>
  )
}

export default function BrandLogo({ variant = 'stacked' }) {
  const [sinImagen, setSinImagen] = useState(false)

  if (sinImagen) return <MarcaProvisional variant={variant} />

  return (
    <img
      className={`brand-logo brand-logo--${variant}`}
      src="/logo.png"
      alt="TesisTrack"
      onError={() => setSinImagen(true)}
    />
  )
}
