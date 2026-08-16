import { useEffect, useState } from 'react'
import '../styles/bienvenida.css'

const CLAVE = 'bienvenidaVista'

/** Milisegundos de cada tramo. Suman ~2,3 s: se disfruta y no estorba. */
const LINEA = 260
const TEXTO = 1500
const APERTURA = 700

/**
 * Telón de bienvenida al entrar al panel.
 *
 * Dos hojas cubren la pantalla, una línea dorada se abre desde el centro, aparece
 * el saludo y las hojas se separan revelando el panel — como un telón que abre.
 *
 * Se muestra **una vez por sesión**, no cada vez que se navega al panel: una
 * animación de dos segundos repetida en cada clic pasa de linda a molesta. La
 * marca vive en `sessionStorage` y `logout()` la borra, así que vuelve a verse
 * al volver a entrar.
 *
 * Con `prefers-reduced-motion` no se muestra: para quien pidió menos movimiento,
 * la mejor animación es ninguna.
 */
export default function BienvenidaPanel({ nombre }) {
  const [fase, setFase] = useState(() => {
    if (typeof window === 'undefined') return 'oculto'
    if (sessionStorage.getItem(CLAVE)) return 'oculto'
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem(CLAVE, '1')
      return 'oculto'
    }
    return 'cerrado'
  })

  useEffect(() => {
    if (fase === 'oculto') return

    sessionStorage.setItem(CLAVE, '1')
    const relojes = [
      setTimeout(() => setFase('saludando'), LINEA),
      setTimeout(() => setFase('abriendo'), LINEA + TEXTO),
      setTimeout(() => setFase('oculto'), LINEA + TEXTO + APERTURA),
    ]
    return () => relojes.forEach(clearTimeout)
    // Solo al montar: la secuencia es lineal y no se reinicia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (fase === 'oculto') return null

  // Solo el nombre de pila: "Te damos la bienvenida, Oscar Reategui Villanueva"
  // no entra en una línea y se lee como un trámite, no como un saludo.
  const pila = (nombre ?? '').trim().split(/\s+/)[0]

  return (
    <div className={`bienvenida bienvenida--${fase}`} aria-hidden="true">
      <div className="bienvenida__hoja bienvenida__hoja--arriba" />
      <div className="bienvenida__hoja bienvenida__hoja--abajo" />

      <div className="bienvenida__centro">
        <span className="bienvenida__linea" />
        <p className="bienvenida__saludo">
          <span className="bienvenida__hola">Te damos la bienvenida</span>
          {pila && <span className="bienvenida__nombre">{pila}</span>}
        </p>
      </div>
    </div>
  )
}
