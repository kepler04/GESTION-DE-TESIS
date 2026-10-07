import { useCallback, useEffect, useState } from 'react'
import {
  crearProyecto,
  eliminarProyecto,
  listarAsesores,
  listarProyectos,
} from '../api/tesistrack'
import { useAuth } from '../auth/AuthContext'
import BorrarProyecto from '../components/BorrarProyecto'
import Integrantes from '../components/Integrantes'
import TablaTesis from '../components/TablaTesis'
import UnirseConCodigo from '../components/UnirseConCodigo'
import { Card, Cargando, ErrorMsg, PageHead, Vacio } from '../components/ui'

/**
 * Mi tesis: la tesis del estudiante, su grupo y a qué clase pertenece.
 *
 * Una tesis puede ser grupal; el grupo lo arma el propio estudiante. Si todavía no
 * tiene asesor, unirse con el código de una clase deja de ser una acción secundaria.
 */
export default function MiTesisPage() {
  const { user } = useAuth()
  const [proyectos, setProyectos] = useState([])
  const [asesores, setAsesores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [mostrarUnirse, setMostrarUnirse] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [asesorId, setAsesorId] = useState('')
  const [codigoInvitacion, setCodigoInvitacion] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [borrando, setBorrando] = useState(null)

  const recargar = useCallback(
    () =>
      listarProyectos()
        .then(setProyectos)
        .catch((e) => setError(e.message))
        .finally(() => setCargando(false)),
    [],
  )

  useEffect(() => {
    recargar()
    listarAsesores().then(setAsesores).catch(() => {})
  }, [recargar])

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

  async function handleBorrar() {
    await eliminarProyecto(borrando.id)
    setBorrando(null)
    await recargar()
  }

  // Sin asesor, unirse a una clase deja de ser una acción secundaria.
  const sinAsesor = proyectos.some((p) => !p.asesor)

  return (
    <>
      <PageHead titulo="Mi tesis" descripcion="Tu tesis, tu grupo y la clase a la que pertenecés.">
        {/* Quien ya tiene tesis pero todavía no la sumó a la clase de su profesor. */}
        {proyectos.length > 0 && (
          <button
            type="button"
            className={`btn ${sinAsesor && !mostrarUnirse ? 'btn--primario' : 'btn--sutil'}`}
            onClick={() => setMostrarUnirse((v) => !v)}
          >
            {mostrarUnirse ? 'Cerrar' : 'Unirme con un código'}
          </button>
        )}
        {proyectos.length === 0 && (
          <button type="button" className="btn btn--primario" onClick={() => setMostrarForm(true)}>
            Crear mi tesis
          </button>
        )}
      </PageHead>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {proyectos.length > 0 && (
        <Integrantes proyecto={proyectos[0]} usuarioId={user?.id} onCambio={recargar} />
      )}

      {mostrarUnirse && proyectos.length > 0 && (
        <UnirseConCodigo
          proyectoId={proyectos[0].id}
          onCerrar={() => setMostrarUnirse(false)}
          onUnido={async () => {
            setMostrarUnirse(false)
            await recargar()
          }}
        />
      )}

      {mostrarForm && (
        <Card titulo="Nueva tesis">
          <form className="form" onSubmit={handleCrear}>
            <label>
              Tema
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
              Código de la clase <span className="tenue">(si tu profesor te pasó uno)</span>
              <input
                value={codigoInvitacion}
                onChange={(e) => setCodigoInvitacion(e.target.value)}
                placeholder="TT-XXXXXX"
                autoCapitalize="characters"
              />
            </label>
            <label>
              Asesor <span className="tenue">(solo si te acompaña en privado, sin una clase)</span>
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
            {asesores.length === 0 && (
              <p className="tenue">
                Ningún asesor da asesorías privadas por ahora. Si tu profesor tiene una clase,
                usá el código que te pasó.
              </p>
            )}
            <div className="form__acciones">
              <button type="submit" className="btn btn--primario" disabled={guardando}>
                {guardando ? 'Creando…' : 'Crear tesis'}
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
          <Vacio>Todavía no creaste tu tesis.</Vacio>
        </Card>
      ) : (
        <Card titulo="Tu tesis">
          <TablaTesis proyectos={proyectos} rol={user?.role} onBorrar={setBorrando} />
        </Card>
      )}

      {borrando && (
        <BorrarProyecto
          proyecto={borrando}
          onCerrar={() => setBorrando(null)}
          onBorrado={handleBorrar}
        />
      )}
    </>
  )
}
