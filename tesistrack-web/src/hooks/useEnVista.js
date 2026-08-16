import { useEffect, useRef, useState } from 'react'

/**
 * Marca un elemento como visto la primera vez que entra en pantalla.
 * Se usa para revelar las secciones al hacer scroll; no vuelve atrás, así que
 * nada "desaparece" si el lector sube de nuevo.
 */
export default function useEnVista(margen = '-12%') {
  const ref = useRef(null)
  const [visto, setVisto] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisto(true)
      return
    }

    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisto(true)
          obs.disconnect()
        }
      },
      { rootMargin: `0px 0px ${margen} 0px` },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [margen])

  return [ref, visto]
}
