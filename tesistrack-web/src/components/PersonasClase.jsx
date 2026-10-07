import { useCallback, useEffect, useState } from 'react'
import { desvincularAsesor, verPersonas } from '../api/tesistrack'
import ConfirmarAccion from './ConfirmarAccion'
import EstadoBadge from './EstadoBadge'
import { Card, Cargando, ErrorMsg, Vacio, fecha } from './ui'
import { plural } from '../utils/formato'

/**
 * La pestaña Personas: el profesor arriba y los alumnos agrupados por grupo.
 *
 * Lo que se ve depende de quién mira (lo decide el backend, acá solo se muestra lo
 * que llega): el **profesor** ve cada grupo con correo, tema, semáforo y fecha de
 * ingreso, y puede quitar a un grupo de la clase; un **estudiante** ve solo los
 * nombres de los demás grupos y los datos de su propio grupo.
 *
 * Quitar es de un **grupo**, no de una persona suelta: pertenecer a una clase es
 * cosa de la tesis (entran juntos con el código y entregan juntos), así que sacar a
 * un alumno de un grupo de dos sería partir una tesis. Es la misma acción que
 * "Quitar de mi lista" de la Decisión 17: la tesis no se borra, solo se desvincula.
 */
export default function PersonasClase({ areaId, claseNombre, onCambio }) {
  const [personas, setPersonas] = useState(null)
  const [error, setError] = useState(null)
  const [aQuitar, setAQuitar] = useState(null)

  const recargar = useCallback(
    () =>
      verPersonas(areaId)
        .then(setPersonas)
        .catch((e) => setError(e.message)),
    [areaId],
  )

  useEffect(() => {
    recargar()
  }, [recargar])

  if (personas === null && !error) return <Cargando />
  if (!personas) return <ErrorMsg>{error}</ErrorMsg>

  const { profesor, grupos, detalle } = personas
  const totalAlumnos = grupos.reduce((suma, g) => suma + g.alumnos.length, 0)

  return (
    <>
      {error && <ErrorMsg>{error}</ErrorMsg>}

      <Card titulo="Profesor">
        <div className="persona">
          <span className="persona__avatar" aria-hidden="true">
            {iniciales(profesor.name)}
          </span>
          <div>
            <strong>{profesor.name}</strong>
            <span className="lista__meta">{profesor.email}</span>
          </div>
        </div>
      </Card>

      <Card titulo={`Alumnos (${totalAlumnos})`}>
        {grupos.length === 0 ? (
          <Vacio>
            {detalle
              ? 'Todavía no se sumó nadie a esta clase. Pasales el código para invitar.'
              : 'Todavía no hay otros alumnos en esta clase.'}
          </Vacio>
        ) : (
          <div className="grupos">
            {grupos.map((g, i) => {
              const conDetalle = detalle || g.propio
              return (
                <section
                  key={g.proyectoId ?? `ajeno-${i}`}
                  className={`grupo ${g.propio ? 'grupo--propio' : ''}`}
                >
                  <header className="grupo__cabecera">
                    <div>
                      <span className="tag">
                        {g.alumnos.length === 1 ? 'Individual' : `Grupo de ${g.alumnos.length}`}
                      </span>
                      {g.propio && <span className="tag tag--ahora">Tu grupo</span>}
                      {conDetalle && (
                        <>
                          <strong className="grupo__tema">
                            {g.tema ?? <em className="tenue">Tema por definir</em>}
                          </strong>
                          <span className="lista__meta">
                            {g.ingreso ? `Ingresó el ${fecha(g.ingreso)}` : 'Fecha de ingreso desconocida'}
                          </span>
                        </>
                      )}
                    </div>
                    {detalle && (
                      <div className="acciones-fila">
                        {g.semaforo && <EstadoBadge estado={g.semaforo} tipo="grupo" />}
                        <button type="button" className="btn btn--sutil" onClick={() => setAQuitar(g)}>
                          Quitar de la clase
                        </button>
                      </div>
                    )}
                  </header>

                  <ul className="grupo__alumnos">
                    {g.alumnos.map((a) => (
                      <li key={a.id}>
                        <span className="persona__avatar persona__avatar--chico" aria-hidden="true">
                          {iniciales(a.nombre)}
                        </span>
                        <div>
                          <strong>{a.nombre}</strong>
                          {a.email && <span className="lista__meta">{a.email}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </Card>

      {aQuitar && (
        <ConfirmarAccion
          titulo="Quitar de la clase"
          etiquetaConfirmar="Quitar de la clase"
          onCerrar={() => setAQuitar(null)}
          onConfirmar={async () => {
            await desvincularAsesor(aQuitar.proyectoId)
            setAQuitar(null)
            await recargar()
            onCambio?.()
          }}
        >
          <p>
            Vas a quitar a <strong>{aQuitar.alumnos.map((a) => a.nombre).join(' y ')}</strong> de{' '}
            <strong>{claseNombre}</strong>
            {aQuitar.alumnos.length > 1 && <> ({plural(aQuitar.alumnos.length, 'alumno')}, que son un solo grupo)</>}.
          </p>
          <p>
            Su tesis <strong>no se borra</strong>: sigue entera, con sus hitos, entregas y
            observaciones. Solo deja de estar en esta clase y de estar a tu cargo. Pueden volver a
            entrar con el código de la clase.
          </p>
        </ConfirmarAccion>
      )}
    </>
  )
}

function iniciales(nombre) {
  return (nombre ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}
