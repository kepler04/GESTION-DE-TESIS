/**
 * Botón para entrar a una reunión. Abre el enlace en otra pestaña.
 *
 * `rel="noopener noreferrer"`: el enlace lo pegó una persona y lleva a un sitio
 * ajeno (Zoom, Meet); esa pestaña no tiene por qué poder tocar la de TesisTrack.
 * Sin enlace (una reunión presencial) no hay botón: se dice en texto.
 */
export default function BotonUnirse({ enlace, className = 'btn btn--primario' }) {
  if (!enlace) {
    return <span className="tenue">Sin enlace (presencial)</span>
  }
  return (
    <a className={className} href={enlace} target="_blank" rel="noopener noreferrer">
      Unirse
    </a>
  )
}
