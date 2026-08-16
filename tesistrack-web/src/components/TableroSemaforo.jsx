import { Vacio } from './ui'

/**
 * Grilla asesorados × actividades: quién entregó, quién debe y quién está en falta.
 *
 * El color nunca va solo. `OBSERVADO` y `COMPLETADO` son casi indistinguibles en
 * deuteranopía, así que cada celda lleva su inicial visible y el estado completo en
 * el `title` — mismo criterio que `EstadoBadge`.
 */
const SEMAFORO = {
  LISTO: { clase: 'ok', letra: 'L', texto: 'Listo' },
  POR_REVISAR: { clase: 'revisar', letra: 'R', texto: 'Por revisar' },
  OBSERVADO: { clase: 'observado', letra: 'O', texto: 'Con observaciones' },
  EN_FALTA: { clase: 'falta', letra: '!', texto: 'En falta' },
  PENDIENTE: { clase: 'pendiente', letra: '·', texto: 'Pendiente' },
  SIN_ASIGNAR: { clase: 'sin', letra: '–', texto: 'Sin asignar' },
}

export default function TableroSemaforo({ tablero }) {
  const { actividades, filas } = tablero

  if (actividades.length === 0) {
    return (
      <Vacio>
        Todavía no dejaste ninguna actividad. La primera que cargues les aparece a todos tus
        asesorados, y también a los que se sumen después.
      </Vacio>
    )
  }

  if (filas.length === 0) {
    return (
      <Vacio>
        Ya tenés actividades, pero nadie se sumó todavía. Pasales el código del espacio: al entrar
        las reciben automáticamente.
      </Vacio>
    )
  }

  return (
    <>
      <div className="tabla-scroll">
        <table className="tabla tablero">
          <thead>
            <tr>
              <th className="tablero__alumno">Asesorado</th>
              {actividades.map((a) => (
                <th key={a.id} className="tablero__col">
                  {a.nombre}
                  {a.fechaLimite && (
                    <span className="lista__meta">
                      {new Date(`${a.fechaLimite}T00:00:00`).toLocaleDateString('es', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.proyectoId}>
                <td className="tablero__alumno">
                  <strong>{f.estudiante?.name}</strong>
                  <span className="lista__meta">{f.titulo}</span>
                </td>
                {f.celdas.map((c) => {
                  const s = SEMAFORO[c.semaforo] ?? SEMAFORO.SIN_ASIGNAR
                  return (
                    <td key={c.actividadId} className="tablero__celda">
                      <span
                        className={`semaforo semaforo--${s.clase}`}
                        title={`${f.estudiante?.name}: ${s.texto}`}
                      >
                        <span aria-hidden="true">{s.letra}</span>
                        <span className="sr-only">{s.texto}</span>
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="tablero__leyenda">
        {Object.values(SEMAFORO).map((s) => (
          <li key={s.clase}>
            <span className={`semaforo semaforo--${s.clase}`} aria-hidden="true">
              {s.letra}
            </span>
            {s.texto}
          </li>
        ))}
      </ul>
    </>
  )
}
