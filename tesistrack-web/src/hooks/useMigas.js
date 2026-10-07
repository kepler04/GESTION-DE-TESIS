import { createContext, useContext, useEffect } from 'react'

/**
 * Migas de pan de la barra superior.
 *
 * El layout arma unas por defecto a partir de la ruta ("Tesis Track / Mis clases");
 * una pantalla que conoce algo que la ruta no dice —el nombre de la clase abierta—
 * las reemplaza con `useMigas`, y al desmontarse vuelven las de la ruta.
 */
export const MigasContext = createContext(() => {})

/** `migas`: [{ texto, a? }]; la última es la pantalla actual y no lleva enlace. */
export default function useMigas(migas) {
  const fijar = useContext(MigasContext)
  const clave = JSON.stringify(migas)
  useEffect(() => {
    if (!migas) return undefined
    fijar(JSON.parse(clave))
    return () => fijar(null)
    // `clave` resume `migas`: cambia solo si cambia lo que se muestra.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, fijar])
}
