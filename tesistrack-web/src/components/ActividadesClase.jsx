import { useCallback, useEffect, useState } from 'react'
import { crearActividad, eliminarActividad, listarActividades } from '../api/tesistrack'
import ConfirmarAccion from './ConfirmarAccion'
import { FechaBloque } from './ProximasReuniones'
import { Card, Cargando, ErrorMsg, Vacio, fecha } from './ui'

/**
 * Las actividades de la clase, en Trabajo de clase.
 *
 * La actividad se deja una vez y le llega a todos los grupos de la clase —y a los
 * que entren después—: a cada uno le aparece como un hito. El **profesor** las crea
 * y las quita; el **estudiante** las lee, con la consigna y la fecha límite.
 *
 * Se muestran en orden cronológico (la que vence primero, arriba); las que no tienen
 * fecha van al final, en el orden en que se crearon.
 */
export default function ActividadesClase({ areaId, editable, onCambio }) {
  const [actividades, setActividades] = useState(null)
  const [error, setError] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [aQuitar, setAQuitar] = useState(null)

  const recargar = useCallback(
    () =>
      listarActividades(areaId)
        .then(setActividades)
        .catch((e) => setError(e.message)),
    [areaId],
  )

  useEffect(() => {
    recargar()
  }, [recargar])

  async function handleCrear(e) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      await crearActividad(areaId, {
        nombre,
        descripcion: descripcion || null,
        fechaLimite: fechaLimite || null,
      })
      setNombre('')
      setDescripcion('')
      setFechaLimite('')
      setMostrarForm(false)
      await recargar()
      onCambio?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  if (actividades === null && !error) return <Cargando />

  const lista = [...(actividades ?? [])].sort((a, b) => {
    if (a.fechaLimite && b.fechaLimite) return a.fechaLimite.localeCompare(b.fechaLimite)
    if (a.fechaLimite) return -1
    if (b.fechaLimite) return 1
    return 0
  })

  return (
    <Card
      titulo="Actividades"
      accion={
        editable && (
          <button
            type="button"
            className={`btn btn--chico ${mostrarForm ? 'btn--sutil' : 'btn--primario'}`}
            onClick={() => setMostrarForm((v) => !v)}
          >
            {mostrarForm ? 'Cancelar' : '+ Nueva actividad'}
          </button>
        )
      }
    >
      {error && <ErrorMsg>{error}</ErrorMsg>}

      {mostrarForm && (
        <form className="form actividad__form" onSubmit={handleCrear}>
          <label>
            Nombre
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Actividad 1 — Matriz de consistencia"
              autoFocus
              required
            />
          </label>
          <label>
            Consigna <span className="tenue">(opcional)</span>
            <textarea rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </label>
          <label>
            Fecha límite <span className="tenue">(opcional)</span>
            <input type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} />
          </label>
          <p className="tenue">
            Le va a aparecer como hito a cada grupo de la clase, y también a los que se sumen más
            adelante.
          </p>
          <div className="form__acciones">
            <button type="submit" className="btn btn--primario" disabled={guardando}>
              {guardando ? 'Repartiendo…' : 'Dejar actividad'}
            </button>
          </div>
        </form>
      )}

      {lista.length === 0 ? (
        <Vacio icono="hitos">
          {editable
            ? 'Todavía no dejaste ninguna actividad. Al crearla, le llega a todos tus grupos.'
            : 'Tu profesor todavía no dejó actividades.'}
        </Vacio>
      ) : (
        <ol className="cronologia">
          {lista.map((a) => (
            <li key={a.id}>
              {a.fechaLimite ? (
                <FechaBloque valor={a.fechaLimite} />
              ) : (
                <span className="fecha-bloque fecha-bloque--sin" aria-hidden="true">
                  <strong>—</strong>
                </span>
              )}
              <div className="cronologia__cuerpo">
                <strong>{a.nombre}</strong>
                {a.descripcion && <span className="lista__meta">{a.descripcion}</span>}
                <span className="lista__meta">
                  {a.fechaLimite ? `Fecha límite: ${fecha(a.fechaLimite)}` : 'Sin fecha límite'}
                </span>
              </div>
              {editable && (
                <button
                  type="button"
                  className="btn btn--fantasma btn--chico"
                  onClick={() => setAQuitar(a)}
                  // Lo que ya tiene entregas no se borra: se desengancha.
                  title="Saca la actividad de la clase. Lo ya entregado se conserva."
                >
                  Quitar
                </button>
              )}
            </li>
          ))}
        </ol>
      )}

      {aQuitar && (
        <ConfirmarAccion
          titulo="Quitar esta actividad"
          etiquetaConfirmar="Quitar actividad"
          onCerrar={() => setAQuitar(null)}
          onConfirmar={async () => {
            await eliminarActividad(areaId, aQuitar.id)
            setAQuitar(null)
            await recargar()
            onCambio?.()
          }}
        >
          <p>
            Vas a quitar <strong>{aQuitar.nombre}</strong> de la clase.
          </p>
          <p>
            Lo que los grupos ya entregaron <strong>se conserva</strong>: esos hitos quedan como
            hitos comunes. Los que nadie tocó se borran para no dejarles basura.
          </p>
        </ConfirmarAccion>
      )}
    </Card>
  )
}
