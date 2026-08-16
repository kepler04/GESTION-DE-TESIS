import '../styles/badge.css'

/**
 * Badge de estado.
 *
 * El estado se comunica con TEXTO + ÍCONO; el color es refuerzo, nunca el único
 * canal. Importa porque OBSERVADO (rojo) y COMPLETADO (verde) son casi
 * indistinguibles en deuteranopía: sin la etiqueta y el ícono, un asesor
 * daltónico no sabría si el hito está aprobado o hay que corregirlo.
 */
const HITO = {
  PENDIENTE: { texto: 'Pendiente', icono: '○', clase: 'neutro' },
  EN_PROCESO: { texto: 'En proceso', icono: '◐', clase: 'proceso' },
  ENTREGADO: { texto: 'Entregado', icono: '↑', clase: 'entregado' },
  OBSERVADO: { texto: 'Observado', icono: '!', clase: 'observado' },
  COMPLETADO: { texto: 'Completado', icono: '✓', clase: 'completado' },
}

const OBSERVACION = {
  PENDIENTE: { texto: 'Pendiente', icono: '!', clase: 'observado' },
  RESUELTA: { texto: 'Resuelta', icono: '✓', clase: 'completado' },
}

const PROYECTO = {
  EN_CURSO: { texto: 'En curso', icono: '◐', clase: 'proceso' },
  FINALIZADO: { texto: 'Finalizado', icono: '✓', clase: 'completado' },
  SUSPENDIDO: { texto: 'Suspendido', icono: '‖', clase: 'neutro' },
}

const MAPAS = { hito: HITO, observacion: OBSERVACION, proyecto: PROYECTO }

export default function EstadoBadge({ estado, tipo = 'hito' }) {
  const def = MAPAS[tipo]?.[estado] ?? { texto: estado, icono: '•', clase: 'neutro' }
  return (
    <span className={`badge badge--${def.clase}`}>
      <span className="badge__icono" aria-hidden="true">
        {def.icono}
      </span>
      {def.texto}
    </span>
  )
}
