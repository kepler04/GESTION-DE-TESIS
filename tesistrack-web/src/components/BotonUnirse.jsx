import Icono from './Icono'

/**
 * Botón para entrar a una reunión (Meet, Zoom). Abre el enlace en otra pestaña y
 * se ve igual en todas: sesiones de la clase y asesorías.
 *
 * `rel="noopener noreferrer"`: el enlace lo pegó una persona y lleva a un sitio
 * ajeno (Zoom, Meet); esa pestaña no tiene por qué poder tocar la de TesisTrack.
 * Sin enlace (una reunión presencial) no hay botón: se dice en texto.
 */
export default function BotonUnirse({ enlace, chico = false }) {
  if (!enlace) {
    return <span className="tenue">Sin enlace (presencial)</span>
  }
  return (
    <a
      className={`btn btn--unirse ${chico ? 'btn--chico' : ''}`}
      href={enlace}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icono nombre="video" />
      Unirse
    </a>
  )
}
