import { useEffect, useState } from 'react'
import { crearProyecto, listarAsesores, listarProyectos } from '../api/tesistrack'
import { useAuth } from '../auth/AuthContext'
import EstadoBadge from '../components/EstadoBadge'
import { Card, Cargando, ErrorMsg, PageHead, Vacio, fecha } from '../components/ui'

export default function ProyectosPage() {
  const { user } = useAuth()
  const esEstudiante = user?.role === 'ESTUDIANTE'

  const [proyectos, setProyectos] = useState([])
  const [asesores, setAsesores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [asesorId, setAsesorId] = useState('')
  const [guardando, setGuardando] = useState(false)

  function recargar() {
    setCargando(true)
    listarProyectos()
      .then(setProyectos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    recargar()
    if (esEstudiante) listarAsesores().then(setAsesores).catch(() => {})
  }, [esEstudiante])

  async function handleCrear(e) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      await crearProyecto({
        titulo,
        descripcion: descripcion || null,
        asesorId: asesorId ? Number(asesorId) : null,
      })
      setTitulo('')
      setDescripcion('')
      setAsesorId('')
      setMostrarForm(false)
      recargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <PageHead
        titulo={esEstudiante ? 'Mi proyecto' : 'Proyectos'}
        descripcion={
          esEstudiante
            ? 'Tu proyecto de tesis y el asesor que lo acompaña.'
            : 'Los proyectos que tenés asignados.'
        }
      >
        {esEstudiante && proyectos.length === 0 && (
          <button type="button" className="btn btn--primario" onClick={() => setMostrarForm(true)}>
            Crear proyecto
          </button>
        )}
      </PageHead>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {mostrarForm && (
        <Card titulo="Nuevo proyecto">
          <form className="form" onSubmit={handleCrear}>
            <label>
              Título
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </label>
            <label>
              Descripción
              <textarea
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </label>
            <label>
              Asesor
              <select value={asesorId} onChange={(e) => setAsesorId(e.target.value)}>
                <option value="">Elegir después</option>
                {asesores.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.email})
                  </option>
                ))}
              </select>
            </label>
            <div className="form__acciones">
              <button type="submit" className="btn btn--primario" disabled={guardando}>
                {guardando ? 'Creando…' : 'Crear proyecto'}
              </button>
              <button type="button" className="btn btn--sutil" onClick={() => setMostrarForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      {cargando ? (
        <Cargando />
      ) : proyectos.length === 0 ? (
        <Card>
          <Vacio>
            {esEstudiante
              ? 'Todavía no creaste tu proyecto de tesis.'
              : 'Todavía no tenés proyectos asignados.'}
          </Vacio>
        </Card>
      ) : (
        <Card titulo={`${proyectos.length} proyecto${proyectos.length > 1 ? 's' : ''}`}>
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Estudiante</th>
                  <th>Asesor</th>
                  <th>Estado</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.titulo}</strong>
                      {p.descripcion && <span className="lista__meta">{p.descripcion}</span>}
                    </td>
                    <td>{p.estudiante?.name}</td>
                    <td>{p.asesor?.name ?? <em className="tenue">Sin asignar</em>}</td>
                    <td>
                      <EstadoBadge estado={p.estado} tipo="proyecto" />
                    </td>
                    <td>{fecha(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  )
}
