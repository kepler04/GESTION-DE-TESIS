import { useState } from 'react'
import '../styles/brand.css'

/**
 * Marca de TesisTrack.
 *
 * Los archivos van en `public/marca/` (ver LEEME.md ahí). Orden de intentos:
 *
 *   barra lateral (fondo oscuro): logo-blanco.png -> logo.png invertido -> SVG
 *   login (fondo claro):          logo.png -> SVG
 *
 * variant: 'stacked' (tarjeta de login) | 'inline' (barra lateral)
 */
const BLANCO = '/marca/logo-blanco.png'
const NEGRO = '/marca/logo.png'

function MarcaProvisional({ variant }) {
  return (
    <span className={`brand-fallback brand-fallback--${variant}`}>
      <svg viewBox="0 0 120 96" aria-hidden="true">
        <path d="M60 6 L116 28 L60 50 L4 28 Z" fill="currentColor" />
        <path d="M40 38 L40 58 C40 70 80 70 80 58 L80 38 Z" fill="currentColor" />
        <path d="M108 33 L108 62" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <circle cx="108" cy="66" r="5" fill="currentColor" />
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
  // 'preferido' -> 'respaldo' -> 'svg'
  const [paso, setPaso] = useState('preferido')

  if (paso === 'svg') return <MarcaProvisional variant={variant} />

  if (variant === 'inline') {
    // Con logo-blanco.png no hace falta filtro; con el negro sí, para que se
    // lea sobre el azul oscuro de la barra.
    const usandoBlanco = paso === 'preferido'
    return (
      <img
        className={`brand-logo brand-logo--inline ${usandoBlanco ? '' : 'brand-logo--invertido'}`}
        src={usandoBlanco ? BLANCO : NEGRO}
        alt="TesisTrack"
        onError={() => setPaso(usandoBlanco ? 'respaldo' : 'svg')}
      />
    )
  }

  return (
    <img
      className="brand-logo brand-logo--stacked"
      src={NEGRO}
      alt="TesisTrack"
      onError={() => setPaso('svg')}
    />
  )
}
