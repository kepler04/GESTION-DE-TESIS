import { useCallback, useEffect, useState } from 'react'
import {
  asignarArea,
  crearProyecto,
  listarAreas,
  listarAsesores,
  listarProyectos,
} from '../api/tesistrack'
import { useAuth } from '../auth/AuthContext'
import EstadoBadge from '../components/EstadoBadge'
import CarpetasAsesor from '../components/CarpetasAsesor'
import GestorAreas from '../components/GestorAreas'
import UnirseConCodigo from '../components/UnirseConCodigo'
import { Card, Cargando, ErrorMsg, PageHead, Vacio, fecha } from '../components/ui'

const SIN_AREA = 'sin-area'

export default function ProyectosPage() {
  const { user } = useAuth()
  const esEstudiante = user?.role === 'ESTUDIANTE'
  const esAsesor = user?.role === 'ASESOR'

  const [proyectos, setProyectos] = useState([])
  const [asesores, setAsesores] = useState([])
  const [areas, setAreas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [mostrarAreas, setMostrarAreas] = useState(false)
  const [mostrarUnirse, setMostrarUnirse] = useState(false)
  const [filtroArea, setFiltroArea] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [asesorId, setAsesorId] = useState('')
  const [codigoInvitacion, setCodigoInvitacion] = useState('')
  const [guardando, setGuardando] = useState(false)

  const recargar = useCallback(() => {
    setCargando(true)
    return listarProyectos()
      .then(setProyectos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [])

  const recargarAreas = useCallback(() => listarAreas().then(setAreas).catch(() => {}), [])

  useEffect(() => {
    recargar()
    if (esEstudiante) listarAsesores().then(setAsesores).catch(() => {})
    if (esAsesor) recargarAreas()
  }, [esEstudiante, esAsesor, recargar, recargarAreas])

  async function handleCrear(e) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      await crearProyecto({
        titulo,
        descripcion: descripcion || null,
        asesorId: asesorId ? Number(asesorId) : null,
        codigoInvitacion: codigoInvitacion.trim() || null,
      })
      setTitulo('')
      setDescripcion('')
      setAsesorId('')
      setCodigoInvitacion('')
      setMostrarForm(false)
      recargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleArea(proyectoId, valor) {
    setError(null)
    try {
      await asignarArea(proyectoId, valor ? Number(valor) : null)
      recargar()
    } catch (err) {
      setError(err.message)
    }
  }

  // El filtro es de pantalla: la API sigue devolviendo todos los proyectos.
  const visibles = proyectos.filter((p) => {
    if (!filtroArea) return true
    if (filtroArea === SIN_AREA) return !p.area
    return p.area?.id === Number(filtroArea)
  })

  const sinArea = proyectos.filter((p) => !p.area).length
  // Sin asesor, unirse deja de ser una acción secundaria.
  const sinAsesor = esEstudiante && proyectos.some((p) => !p.asesor)

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
        {/* Quien ya tiene tesis pero todavía no la sumó al espacio de su asesor. */}
        {esEstudiante && proyectos.length > 0 && (
          <button
            type="button"
            className={`btn ${sinAsesor && !mostrarUnirse ? 'btn--primario' : 'btn--sutil'}`}
            onClick={() => setMostrarUnirse((v) => !v)}
          >
            {mostrarUnirse ? 'Cerrar' : 'Unirme con un código'}
          </button>
        )}
        {esEstudiante && proyectos.length === 0 && (
          <button type="button" className="btn btn--primario" onClick={() => setMostrarForm(true)}>
            Crear proyecto
          </button>
        )}
      </PageHead>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {esEstudiante && mostrarUnirse && proyectos.length > 0 && (
        <UnirseConCodigo
          proyectoId={proyectos[0].id}
          onCerrar={() => setMostrarUnirse(false)}
          onUnido={async () => {
            setMostrarUnirse(false)
            await recargar()
          }}
        />
      )}

      {/* Las carpetas van siempre visibles: el código es lo que el asesor
          necesita a mano para poder invitar. Administrar es lo secundario. */}
      {esAsesor && (
        <CarpetasAsesor
          areas={areas}
          proyectos={proyectos}
          administrando={mostrarAreas}
          onAdministrar={() => setMostrarAreas((v) => !v)}
        />
      )}

      {esAsesor && mostrarAreas && (
        <GestorAreas
          areas={areas}
          onCerrar={() => setMostrarAreas(false)}
          onCambio={async () => {
            await recargarAreas()
            await recargar()
          }}
        />
      )}

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
              Código de invitación <span className="tenue">(si tu asesor te pasó uno)</span>
              <input
                value={codigoInvitacion}
                onChange={(e) => setCodigoInvitacion(e.target.value)}
                placeholder="TT-XXXXXX"
                autoCapitalize="characters"
              />
            </label>
            <label>
              Asesor <span className="tenue">(si no tenés código)</span>
              <select
                value={asesorId}
                onChange={(e) => setAsesorId(e.target.value)}
                disabled={codigoInvitacion.trim() !== ''}
              >
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

      {/* El filtro solo aparece cuando hay áreas que filtrar. */}
      {esAsesor && areas.length > 0 && proyectos.length > 0 && (
        <Card>
          <label className="filtro-area">
            <span>Ver</span>
            <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
              <option value="">Todas mis tesis ({proyectos.length})</option>
              {areas.map((a) => {
                const cuantos = proyectos.filter((p) => p.area?.id === a.id).length
                return (
                  <option key={a.id} value={a.id}>
                    {a.nombre} ({cuantos})
                  </option>
                )
              })}
              {sinArea > 0 && <option value={SIN_AREA}>Sin área ({sinArea})</option>}
            </select>
          </label>
        </Card>
      )}

      {cargando ? (
        <Cargando />
      ) : proyectos.length === 0 ? (
        <Card>
          <Vacio>
            {esEstudiante && 'Todavía no creaste tu proyecto de tesis.'}
            {esAsesor &&
              (areas.length === 0
                ? 'Todavía no tenés asesorados. Creá una carpeta arriba para obtener tu código de invitación.'
                : 'Todavía no tenés asesorados. Pasales el código de tu carpeta: cuando lo peguen al crear su tesis, aparecen acá.')}
            {!esEstudiante && !esAsesor && 'Todavía no hay proyectos.'}
          </Vacio>
        </Card>
      ) : (
        <Card titulo={`${visibles.length} proyecto${visibles.length === 1 ? '' : 's'}`}>
          {visibles.length === 0 ? (
            <Vacio>Ninguna de tus tesis está en esa área.</Vacio>
          ) : (
            <div className="tabla-scroll">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Estudiante</th>
                    <th>Asesor</th>
                    {esAsesor && <th>Área</th>}
                    <th>Estado</th>
                    <th>Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.titulo}</strong>
                        {p.descripcion && <span className="lista__meta">{p.descripcion}</span>}
                      </td>
                      <td>{p.estudiante?.name}</td>
                      <td>{p.asesor?.name ?? <em className="tenue">Sin asignar</em>}</td>
                      {esAsesor && (
                        <td>
                          {areas.length === 0 ? (
                            <em className="tenue">Creá un área primero</em>
                          ) : (
                            <select
                              value={p.area?.id ?? ''}
                              onChange={(e) => handleArea(p.id, e.target.value)}
                              aria-label={`Área de ${p.titulo}`}
                            >
                              <option value="">Sin área</option>
                              {areas.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.nombre}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                      )}
                      <td>
                        <EstadoBadge estado={p.estado} tipo="proyecto" />
                      </td>
                      <td>{fecha(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </>
  )
}
