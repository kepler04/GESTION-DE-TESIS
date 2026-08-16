import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import PoliticaContenido, { VERSION_POLITICA } from './PoliticaContenido'
// El modal comparte la hoja de estilos de la página legal. Se importa acá y no
// solo en PrivacidadPage porque quien entra directo a /registro nunca carga esa página.
import '../styles/privacidad.css'

/**
 * La política, leída sin salir del formulario.
 *
 * Antes esto era un enlace a /privacidad. Aunque abría otra pestaña, la página
 * ofrecía botones de "volver" que devolvían a un registro vacío, y el botón atrás
 * del navegador hacía lo mismo: quien iba a leer las políticas perdía todo lo que
 * había cargado. Un modal elimina el problema de raíz — no hay navegación, así
 * que no hay nada que perder.
 *
 * Se usa <dialog> nativo por lo que trae gratis: cierre con Esc, foco atrapado
 * adentro y el resto de la página inerte para lectores de pantalla.
 */
export default function PoliticaModal({ abierto, onCerrar }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (abierto && !dialogo.open) {
      dialogo.showModal()
    } else if (!abierto && dialogo.open) {
      dialogo.close()
    }
  }, [abierto])

  // Se monta en <body> y no donde se usa. Si viviera dentro del formulario,
  // heredaría los estilos de la tarjeta de login (`.auth-card h2` la pisaba con
  // la serif de 32px) y el mismo texto se vería distinto acá que en /privacidad.
  return createPortal(
    <dialog
      ref={ref}
      className="politica-modal"
      aria-labelledby="politica-titulo"
      // Esc dispara 'cancel'/'close': avisamos al padre para que sincronice su estado.
      onClose={onCerrar}
    >
      <div className="politica-modal__head">
        <div>
          <p className="legal__version">Versión {VERSION_POLITICA}</p>
          <h1 id="politica-titulo">Política de privacidad</h1>
        </div>
        <button
          type="button"
          className="politica-modal__cerrar"
          onClick={onCerrar}
          aria-label="Cerrar la política"
        >
          ✕
        </button>
      </div>

      <div className="politica-modal__cuerpo legal-texto">
        <PoliticaContenido />
      </div>

      <div className="politica-modal__pie">
        <a href="/privacidad" target="_blank" rel="noreferrer">
          Abrir en otra pestaña ↗
        </a>
        <button type="button" className="btn btn--primario" onClick={onCerrar}>
          Entendido, volver al registro
        </button>
      </div>
    </dialog>,
    document.body,
  )
}
