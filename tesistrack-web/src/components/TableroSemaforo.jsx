import { Vacio, nombres } from './ui'

/**
 * Matriz grupos × actividades: quién entregó, quién debe y quién está en falta.
 *
 * El color nunca va solo. `OBSERVADO` y `COMPLETADO` son casi indistinguibles en
 * deuteranopía, así que cada celda dice su estado con ícono **y texto**, y la
 * leyenda queda fija abajo mientras se recorre la matriz.
 */
const SEMAFORO = {
  LISTO: { clase: 'ok', icono: '✓', texto: 'Listo' },
  POR_REVISAR: { clase: 'revisar', icono: '↑', texto: 'Por revisar' },
  OBSERVADO: { clase: 'observado', icono: '!', texto: 'Observado' },
  EN_FALTA: { clase: 'falta', icono: '✕', texto: 'En falta' },
  PENDIENTE: { clase: 'pendiente', icono: '○', texto: 'Pendiente' },
  SIN_ASIGNAR: { clase: 'sin', icono: '–', texto: 'Sin asignar' },
}

/** Qué quiere decir cada estado, para el `title` de la leyenda. */
const EXPLICACION = {
  LISTO: 'El profesor lo dio por completado',
  POR_REVISAR: 'El grupo entregó y espera tu revisión',
  OBSERVADO: 'Observaste la entrega y el grupo tiene que corregir',
  EN_FALTA: 'Venció la fecha y no hay entrega',
  PENDIENTE: 'Todavía en plazo, sin entregar',
  SIN_ASIGNAR: 'El grupo entró a la clase después de que se quitara la actividad',
}

export default function TableroSemaforo({ tablero }) {
  const { actividades, filas } = tablero

  if (actividades.length === 0) {
    return (
      <Vacio icono="tabla">
        Todavía no dejaste ninguna actividad. La primera que cargues les aparece a todos tus
        grupos, y también a los que se sumen después.
      </Vacio>
    )
  }

  if (filas.length === 0) {
    return (
      <Vacio icono="personas">
        Ya tenés actividades, pero nadie se sumó todavía. Pasales el código de la clase: al entrar
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
              <th className="tablero__alumno">Grupo</th>
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
                  {/* Una tesis grupal ocupa una fila con todos sus integrantes:
                      entregan una sola vez, así que su avance es uno solo. */}
                  <strong>{nombres(f.estudiantes)}</strong>
                  <span className="lista__meta">{f.titulo || 'Tema por definir'}</span>
                </td>
                {f.celdas.map((c) => {
                  const s = SEMAFORO[c.semaforo] ?? SEMAFORO.SIN_ASIGNAR
                  return (
                    <td key={c.actividadId} className="tablero__celda">
                      <span
                        className={`celda celda--${s.clase}`}
                        title={`${nombres(f.estudiantes)}: ${s.texto}`}
                      >
                        <span aria-hidden="true">{s.icono}</span>
                        {s.texto}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="tablero__leyenda" aria-label="Leyenda del semáforo">
        <li className="tablero__leyenda-titulo">Leyenda</li>
        {Object.entries(SEMAFORO).map(([clave, s]) => (
          <li key={clave} title={EXPLICACION[clave]}>
            <span className={`celda celda--${s.clase}`}>
              <span aria-hidden="true">{s.icono}</span>
              {s.texto}
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}
