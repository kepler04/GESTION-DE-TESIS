import evaluarContrasena, { CANTIDAD_NIVELES } from '../utils/fuerzaContrasena'

/**
 * Medidor de fuerza de la contraseña.
 *
 * Sigue el mismo criterio que EstadoBadge: la fuerza se comunica con **texto**,
 * y el color es refuerzo, nunca el único canal. Un usuario daltónico no
 * distinguiría "débil" de "fuerte" si solo cambiara el color de la barra.
 *
 * `aria-live="polite"` para que un lector de pantalla anuncie el cambio de nivel
 * mientras se escribe, sin interrumpir la escritura.
 */
export default function FuerzaContrasena({ valor, email }) {
  const resultado = evaluarContrasena(valor, { email })

  // Sin nada escrito no hay nada que decir: el medidor no debe gritar "muy débil"
  // apenas la persona hace foco en el campo.
  if (!resultado) return null

  const { etiqueta, clase, avisos, sugerencia } = resultado
  const llenos = Math.round((resultado.porcentaje / 100) * CANTIDAD_NIVELES)

  return (
    <div className={`fuerza fuerza--${clase}`}>
      <div className="fuerza__barra" aria-hidden="true">
        {Array.from({ length: CANTIDAD_NIVELES }, (_, i) => (
          <span key={i} className={`fuerza__tramo ${i < llenos ? 'is-lleno' : ''}`} />
        ))}
      </div>

      <p className="fuerza__linea" aria-live="polite">
        <span className="fuerza__etiqueta">Seguridad: {etiqueta}</span>
        {!resultado.cumpleMinimo && <span className="fuerza__minimo">· mínimo 8 caracteres</span>}
      </p>

      {avisos.map((aviso) => (
        <p key={aviso} className="fuerza__aviso">
          {aviso}
        </p>
      ))}

      {sugerencia && <p className="fuerza__sugerencia">{sugerencia}</p>}
    </div>
  )
}
