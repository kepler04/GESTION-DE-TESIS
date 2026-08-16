import { useEffect, useState } from 'react'
import { cambiarEstadoHito, crearHito, listarHitos } from '../api/tesistrack'
import useProyectoActivo from '../hooks/useProyectoActivo'
import { useAuth } from '../auth/AuthContext'
import EstadoBadge from '../components/EstadoBadge'
import { Card, Cargando, ErrorMsg, PageHead, SelectorProyecto, SinProyecto, Vacio, fecha } from '../components/ui'

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'ENTREGADO', 'OBSERVADO', 'COMPLETADO']

export default function HitosPage() {
  const { user } = useAuth()
  const { proyectos, activoId, activo, seleccionar, cargando: cargandoProyectos } = useProyectoActivo()

  // Solo el asesor del proyecto crea y edita hitos (Decisión 2).
  const puedeEditar = user?.role === 'ASESOR' && activo?.asesor?.id === user?.id

  const [hitos, setHitos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [guardando, setGuardando] = useState(false)

  function recargar(id = activoId) {
    if (!id) return
    setCargando(true)
    listarHitos(id)
      .then(setHitos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    recargar(activoId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activoId])

  async function handleCrear(e) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      await crearHito(activoId, {
        nombre,
        fechaLimite: fechaLimite || null,
        orden: hitos.length + 1,
      })
      setNombre('')
      setFechaLimite('')
      setMostrarForm(false)
      recargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleEstado(hitoId, estado) {
    setError(null)
    try {
      await cambiarEstadoHito(hitoId, estado)
      recargar()
    } catch (err) {
      setError(err.message)
    }
  }

  if (cargandoProyectos) return <Cargando />
  if (!activoId) return <SinProyecto rol={user?.role} />

  return (
    <>
      <PageHead
        titulo="Hitos"
        descripcion="Las etapas de esta tesis. Cada proyecto define las suyas."
      >
        <SelectorProyecto proyectos={proyectos} activoId={activoId} onChange={seleccionar} />
        {puedeEditar && (
          <button type="button" className="btn btn--primario" onClick={() => setMostrarForm(true)}>
            Nuevo hito
          </button>
        )}
      </PageHead>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {mostrarForm && (
        <Card titulo="Nuevo hito">
          <form className="form" onSubmit={handleCrear}>
            <label>
              Nombre
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </label>
            <label>
              Fecha límite
              <input
                type="date"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
              />
            </label>
            <div className="form__acciones">
              <button type="submit" className="btn btn--primario" disabled={guardando}>
                {guardando ? 'Creando…' : 'Crear hito'}
              </button>
              <button type="button" className="btn btn--sutil" onClick={() => setMostrarForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card titulo={`${hitos.length} hito${hitos.length === 1 ? '' : 's'}`}>
        {cargando ? (
          <Cargando />
        ) : hitos.length === 0 ? (
          <Vacio>
            {puedeEditar
              ? 'Este proyecto todavía no tiene hitos. Creá el primero.'
              : 'El asesor todavía no definió los hitos de este proyecto.'}
          </Vacio>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Hito</th>
                  <th>Fecha límite</th>
                  <th>Estado</th>
                  {puedeEditar && <th>Cambiar estado</th>}
                </tr>
              </thead>
              <tbody>
                {hitos.map((h) => (
                  <tr key={h.id}>
                    <td className="tenue">{h.orden}</td>
                    <td>
                      <strong>{h.nombre}</strong>
                      {h.descripcion && <span className="lista__meta">{h.descripcion}</span>}
                    </td>
                    <td>{fecha(h.fechaLimite)}</td>
                    <td>
                      <EstadoBadge estado={h.estado} />
                    </td>
                    {puedeEditar && (
                      <td>
                        <select
                          value={h.estado}
                          onChange={(e) => handleEstado(h.id, e.target.value)}
                          aria-label={`Estado de ${h.nombre}`}
                        >
                          {ESTADOS.map((e) => (
                            <option key={e} value={e}>
                              {e.replace('_', ' ').toLowerCase()}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
