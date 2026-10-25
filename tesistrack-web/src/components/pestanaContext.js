import { createContext } from 'react'

/**
 * true cuando una pantalla (Hitos, Entregas…) se muestra como pestaña de Mi tesis:
 * su título y su selector de tesis sobran, porque Mi tesis ya los tiene arriba. Los
 * botones de acción de la pantalla se conservan.
 */
export const PestanaContext = createContext(false)
