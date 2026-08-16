import { useEffect, useState } from 'react'

/**
 * El argumento de TesisTrack, en una imagen.
 *
 * Los fragmentos arrancan desparramados y en ángulo — cada uno es un lugar
 * real donde hoy vive la información de una tesis, según [[Contexto]]:
 * WhatsApp, correo, la carpeta de descargas, la libreta de la reunión.
 * Después se ordenan en una sola columna.
 *
 * No es decoración: es el diagnóstico del vault ("el problema no es que la
 * información no exista, sino que está dispersa") puesto en movimiento.
 */
const FRAGMENTOS = [
  { fuente: 'WhatsApp', texto: 'prof, le mandé el capítulo 2 🙏', x: -18, y: -14, giro: -7 },
  { fuente: 'Correo', texto: 'RE: RE: observaciones marco teórico', x: 20, y: -8, giro: 5 },
  { fuente: 'Descargas', texto: 'Marco teorico_v3_FINAL_ok.docx', x: -12, y: 12, giro: 4 },
  { fuente: 'Libreta', texto: 'quedamos en ampliar antecedentes', x: 16, y: 20, giro: -5 },
  { fuente: 'WhatsApp', texto: '¿ya corregiste lo del método?', x: -22, y: 34, giro: 6 },
]

export default function Dispersion() {
  const [ordenado, setOrdenado] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOrdenado(true)
      return
    }
    // Se muestra el desorden un momento antes de resolverlo: si arranca
    // ordenado, no se entiende cuál era el problema.
    const t = setTimeout(() => setOrdenado(true), 2200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`dispersion ${ordenado ? 'is-ordenado' : ''}`}>
      <div className="dispersion__cartel" aria-hidden="true">
        <span className="dispersion__antes">Hoy</span>
        <span className="dispersion__despues">En TesisTrack</span>
      </div>

      <div className="dispersion__campo">
        {FRAGMENTOS.map((f, i) => (
          <article
            key={f.texto}
            className="fragmento"
            style={{
              '--x': `${f.x}%`,
              '--y': `${f.y}%`,
              '--giro': `${f.giro}deg`,
              '--orden': i,
            }}
          >
            <span className="fragmento__fuente">{f.fuente}</span>
            <p>{f.texto}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
