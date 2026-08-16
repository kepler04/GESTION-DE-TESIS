import { useEffect, useRef } from 'react'

/**
 * Fondo animado del panel de bienvenida.
 *
 * Dos capas sobre un mismo canvas:
 *
 *  1. Ambiente — partículas a la deriva que se enlazan con sus vecinas.
 *     Es el telón de fondo: se mueve, pero no compite con el texto.
 *
 *  2. La cadena de hitos — el elemento con significado. Un pulso dorado
 *     recorre los hitos de una tesis en orden y los va encendiendo. No es
 *     decoración: es literalmente lo que hace el producto, y va sincronizado
 *     con la línea de estado que se ve debajo del texto.
 *
 * `onHito` avisa cada vez que el pulso llega a un hito, para que el texto
 * de abajo acompañe.
 */

// Posiciones normalizadas (0–1). Suben de izquierda a derecha: el avance se lee
// como una progresión, no como una constelación al azar.
//
// Van cargadas al margen derecho a propósito: el texto ocupa la mitad izquierda
// y el trazo dorado cruzándole el titular arruinaba la lectura.
const CADENA = [
  { x: 0.46, y: 0.95 },
  { x: 0.61, y: 0.77 },
  { x: 0.74, y: 0.56 },
  { x: 0.85, y: 0.34 },
  { x: 0.94, y: 0.13 },
]

/**
 * Hasta dónde llega el pulso. Los hitos que siguen quedan tenues a propósito:
 * la tesis de ejemplo va por "Metodología", así que el oro marca lo recorrido
 * y lo apagado, lo que falta. Encenderlos todos diría "terminado" y
 * contradiría el estado que muestra la etiqueta de abajo.
 */
const AVANCE_HASTA = 2

const MS_POR_TRAMO = 1250
const MS_PAUSA_FINAL = 2600
const ORO = [216, 176, 92]

export default function HeroConstelacion({ onHito }) {
  const canvasRef = useRef(null)
  const onHitoRef = useRef(onHito)
  onHitoRef.current = onHito

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let ancho = 0
    let alto = 0
    let particulas = []
    let raf = null

    function redimensionar() {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      ancho = rect.width
      alto = rect.height
      canvas.width = Math.round(ancho * dpr)
      canvas.height = Math.round(alto * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Densidad por área: en un panel angosto no queremos una sopa de puntos.
      const cantidad = Math.round(Math.min(46, Math.max(18, (ancho * alto) / 17000)))
      particulas = Array.from({ length: cantidad }, () => ({
        x: Math.random() * ancho,
        y: Math.random() * alto,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.5 + 0.9,
      }))
    }

    const observer = new ResizeObserver(redimensionar)
    observer.observe(canvas)
    redimensionar()

    const puntos = () => CADENA.map((p) => ({ x: p.x * ancho, y: p.y * alto }))

    function dibujarAmbiente() {
      const UMBRAL = Math.min(190, ancho * 0.3)
      ctx.lineWidth = 1
      for (let i = 0; i < particulas.length; i++) {
        for (let j = i + 1; j < particulas.length; j++) {
          const dx = particulas[i].x - particulas[j].x
          const dy = particulas[i].y - particulas[j].y
          const d = Math.hypot(dx, dy)
          if (d > UMBRAL) continue
          ctx.strokeStyle = `rgba(190, 206, 236, ${(1 - d / UMBRAL) * 0.17})`
          ctx.beginPath()
          ctx.moveTo(particulas[i].x, particulas[i].y)
          ctx.lineTo(particulas[j].x, particulas[j].y)
          ctx.stroke()
        }
      }
      for (const p of particulas) {
        ctx.fillStyle = 'rgba(206, 219, 242, 0.5)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function dibujarCadena(indice, avance) {
      const pts = puntos()

      // Trazo completo, tenue: el camino que la tesis todavía tiene por delante.
      ctx.strokeStyle = 'rgba(214, 226, 247, 0.2)'
      ctx.lineWidth = 1.25
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
      ctx.stroke()

      // Trazo recorrido, en oro.
      ctx.strokeStyle = `rgba(${ORO[0]}, ${ORO[1]}, ${ORO[2]}, 0.85)`
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i <= indice; i++) ctx.lineTo(pts[i].x, pts[i].y)
      let cabeza = pts[indice]
      if (indice < AVANCE_HASTA) {
        const a = pts[indice]
        const b = pts[indice + 1]
        cabeza = { x: a.x + (b.x - a.x) * avance, y: a.y + (b.y - a.y) * avance }
        ctx.lineTo(cabeza.x, cabeza.y)
      }
      ctx.stroke()

      // Nodos: los alcanzados quedan encendidos, el resto en espera.
      pts.forEach((p, i) => {
        const hecho = i <= indice
        ctx.beginPath()
        ctx.arc(p.x, p.y, hecho ? 4.5 : 3.2, 0, Math.PI * 2)
        ctx.fillStyle = hecho
          ? `rgba(${ORO[0]}, ${ORO[1]}, ${ORO[2]}, 1)`
          : 'rgba(214, 226, 247, 0.42)'
        ctx.fill()
        if (hecho) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 10, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${ORO[0]}, ${ORO[1]}, ${ORO[2]}, 0.28)`
          ctx.lineWidth = 1.25
          ctx.stroke()
        }
      })

      // El pulso que avanza, con halo.
      if (indice < AVANCE_HASTA) {
        const halo = ctx.createRadialGradient(cabeza.x, cabeza.y, 0, cabeza.x, cabeza.y, 24)
        halo.addColorStop(0, `rgba(${ORO[0]}, ${ORO[1]}, ${ORO[2]}, 0.5)`)
        halo.addColorStop(1, `rgba(${ORO[0]}, ${ORO[1]}, ${ORO[2]}, 0)`)
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(cabeza.x, cabeza.y, 24, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = 'rgba(247, 233, 195, 1)'
        ctx.beginPath()
        ctx.arc(cabeza.x, cabeza.y, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // --- sin animación: se dibuja el estado final y listo ---
    if (quieto) {
      const pintarQuieto = () => {
        ctx.clearRect(0, 0, ancho, alto)
        dibujarAmbiente()
        dibujarCadena(AVANCE_HASTA, 0)
      }
      pintarQuieto()
      onHitoRef.current?.(AVANCE_HASTA)
      const alRedimensionar = () => pintarQuieto()
      window.addEventListener('resize', alRedimensionar)
      return () => {
        observer.disconnect()
        window.removeEventListener('resize', alRedimensionar)
      }
    }

    // --- animado ---
    let indice = 0
    let inicioTramo = performance.now()
    let ultimoAviso = -1

    function cuadro(ahora) {
      ctx.clearRect(0, 0, ancho, alto)

      for (const p of particulas) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = ancho + 10
        if (p.x > ancho + 10) p.x = -10
        if (p.y < -10) p.y = alto + 10
        if (p.y > alto + 10) p.y = -10
      }
      dibujarAmbiente()

      const ultimo = AVANCE_HASTA
      const duracion = indice === ultimo ? MS_PAUSA_FINAL : MS_POR_TRAMO
      const avance = Math.min(1, (ahora - inicioTramo) / duracion)
      // Suavizado: arranca y frena despacio, como algo que se completa.
      const suave = avance < 0.5 ? 2 * avance * avance : 1 - Math.pow(-2 * avance + 2, 2) / 2

      if (indice !== ultimoAviso) {
        onHitoRef.current?.(indice)
        ultimoAviso = indice
      }

      dibujarCadena(indice, indice === ultimo ? 0 : suave)

      if (avance >= 1) {
        inicioTramo = ahora
        indice = indice === ultimo ? 0 : indice + 1
        if (indice === 0) ultimoAviso = -1
      }

      raf = requestAnimationFrame(cuadro)
    }

    raf = requestAnimationFrame(cuadro)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
}
