import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  crearArea,
  desvincularAsesor,
  eliminarProyecto,
  listarAreas,
  listarProyectos,
} from '../api/tesistrack'
import BorrarProyecto from '../components/BorrarProyecto'
import TablaTesis from '../components/TablaTesis'
import { Card, Cargando, ErrorMsg, PageHead, Vacio } from '../components/ui'
import { plural } from '../utils/formato'
import { useAuth } from '../auth/AuthContext'

/**
 * Mis clases: donde el profesor crea y administra sus clases.
 *
 * Una clase tiene un nombre y un código de invitación; los estudiantes entran con el
 * código y forman grupos. Cada tarjeta lleva a la clase, que es donde se hace todo lo
 * demás (avisos, actividades, materiales, personas, seguimiento y configuración).
 * Debajo queda la lista de todas las tesis a su cargo, con quitar de la lista y
 * borrar (Decisión 17).
 */
export default function MisClasesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clases, setClases] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [creando, setCreando] = useState(false)
  const [copiado, setCopiado] = useState(null)
  // Tesis que espera confirmación de borrado; null si no hay ninguna.
  const [borrando, setBorrando] = useState(null)

  const recargar = useCallback(
    () =>
      Promise.all([listarAreas(), listarProyectos()])
        .then(([c, p]) => {
          setClases(c)
          setProyectos(p)
        })
        .catch((e) => setError(e.message))
        .finally(() => setCargando(false)),
    [],
  )

  useEffect(() => {
    recargar()
  }, [recargar])

  async function handleCrear(e) {
    e.preventDefault()
    setError(null)
    setCreando(true)
    try {
      const clase = await crearArea(nombre.trim())
      setNombre('')
      setMostrarForm(false)
      // Recién creada, lo que hace falta es el código para invitar: va directo a ella.
      navigate(`/clases/${clase.id}`)
    } catch (err) {
      setError(err.message)
      setCreando(false)
    }
  }

  async function handleDesvincular(proyecto) {
    setError(null)
    try {
      await desvincularAsesor(proyecto.id)
      await recargar()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleBorrar() {
    await eliminarProyecto(borrando.id)
    setBorrando(null)
    await recargar()
  }

  if (cargando) return <Cargando />

  return (
    <>
      <PageHead
        titulo="Mis clases"
        descripcion="Tus clases, con el código para invitar a tus alumnos."
      >
        <button
          type="button"
          className="btn btn--primario"
          onClick={() => setMostrarForm((v) => !v)}
        >
          {mostrarForm ? 'Cancelar' : 'Nueva clase'}
        </button>
      </PageHead>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {mostrarForm && (
        <Card titulo="Nueva clase">
          <form className="form" onSubmit={handleCrear}>
            <label>
              Nombre de la clase
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Taller de Tesis I, UPN – Ingeniería, Seminario 2026…"
                maxLength={80}
                autoFocus
                required
              />
            </label>
            <p className="tenue">
              Al crearla te damos un código para invitar a tus alumnos, y tres carpetas de
              materiales para empezar. Después podés cambiar el nombre.
            </p>
            <div className="form__acciones">
              <button type="submit" className="btn btn--primario" disabled={creando || !nombre.trim()}>
                {creando ? 'Creando…' : 'Crear clase'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {clases.length === 0 ? (
        <Card>
          <Vacio
            cta={
              !mostrarForm && (
                <button type="button" className="btn btn--primario" onClick={() => setMostrarForm(true)}>
                  Crear mi primera clase
                </button>
              )
            }
          >
            Todavía no tenés clases. Creá una para obtener tu código de invitación: tus alumnos lo
            pegan al crear su tesis y aparecen en la clase.
          </Vacio>
        </Card>
      ) : (
        <div className="clases">
          {clases.map((c) => {
            const grupos = proyectos.filter((p) => p.area?.id === c.id)
            return (
              <article key={c.id} className="clase-card">
                <h2 className="clase-card__nombre">{c.nombre}</h2>
                <p className="clase-card__cuenta">
                  {grupos.length === 0 ? 'Todavía sin grupos' : plural(grupos.length, 'grupo')}
                </p>

                <p className="carpeta__etiqueta">Código para invitar</p>
                <div className="carpeta__codigo-caja">
                  <code className="carpeta__codigo">{c.codigo}</code>
                  <button
                    type="button"
                    className="btn btn--sutil"
                    onClick={() => {
                      navigator.clipboard?.writeText(c.codigo)
                      setCopiado(c.id)
                      setTimeout(() => setCopiado(null), 1800)
                    }}
                  >
                    {copiado === c.id ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>

                <Link className="btn btn--primario clase-card__abrir" to={`/clases/${c.id}`}>
                  Abrir clase
                </Link>
              </article>
            )
          })}
        </div>
      )}

      {proyectos.length > 0 && (
        <Card titulo={`Grupos (${proyectos.length})`}>
          <TablaTesis
            proyectos={proyectos}
            rol={user?.role}
            onDesvincular={handleDesvincular}
            onBorrar={setBorrando}
          />
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
