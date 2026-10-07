import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  crearArea,
  desvincularAsesor,
  eliminarProyecto,
  listarAreas,
  listarProyectos,
  obtenerDashboardAsesor,
} from '../api/tesistrack'
import BorrarProyecto from '../components/BorrarProyecto'
import BotonUnirse from '../components/BotonUnirse'
import Icono from '../components/Icono'
import RepartoSemaforo from '../components/RepartoSemaforo'
import TablaTesis from '../components/TablaTesis'
import { Card, Cargando, ChipCodigo, ErrorMsg, PageHead, Vacio } from '../components/ui'
import { diaYHora, plural } from '../utils/formato'
import { useAuth } from '../auth/AuthContext'

/** Con más clases que esto aparece el buscador; con menos, se ven todas de un vistazo. */
const CLASES_PARA_BUSCAR = 3

/**
 * Mis clases: donde el profesor crea y administra sus clases.
 *
 * Una clase tiene un nombre y un código de invitación; los estudiantes entran con el
 * código y forman grupos. Cada tarjeta (estilo Classroom) dice cuántos son, cómo
 * vienen y cuándo es la próxima sesión, y lleva a la clase, que es donde se hace
 * todo lo demás. Debajo queda la lista de todas las tesis a su cargo, con quitar de
 * la lista y borrar (Decisión 17).
 */
export default function MisClasesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clases, setClases] = useState([])
  const [resumen, setResumen] = useState({})
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [creando, setCreando] = useState(false)
  // Tesis que espera confirmación de borrado; null si no hay ninguna.
  const [borrando, setBorrando] = useState(null)

  const recargar = useCallback(
    () =>
      Promise.all([listarAreas(), listarProyectos(), obtenerDashboardAsesor()])
        .then(([c, p, d]) => {
          setClases(c)
          setProyectos(p)
          // Los números y el semáforo de cada clase salen del panel agregado.
          setResumen(Object.fromEntries(d.clases.map((x) => [x.id, x])))
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

  const filtro = busqueda.trim().toLowerCase()
  const visibles = filtro
    ? clases.filter(
        (c) => c.nombre.toLowerCase().includes(filtro) || c.codigo.toLowerCase().includes(filtro),
      )
    : clases

  return (
    <>
      <PageHead
        titulo="Mis clases"
        descripcion="Tus salones de tesis: el código para invitar, cómo vienen los grupos y la próxima sesión."
      >
        <button
          type="button"
          className={`btn ${mostrarForm ? 'btn--sutil' : 'btn--primario'}`}
          onClick={() => setMostrarForm((v) => !v)}
        >
          {!mostrarForm && <Icono nombre="mas" />}
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

      {clases.length > CLASES_PARA_BUSCAR && (
        <div className="buscador">
          <label>
            <span className="sr-only">Buscar clase por nombre o código</span>
            <Icono nombre="buscar" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar clase por nombre o código…"
            />
          </label>
        </div>
      )}

      {clases.length === 0 ? (
        <Card>
          <Vacio
            icono="clases"
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
        <>
          {visibles.length === 0 && (
            <Vacio icono="buscar">Ninguna clase coincide con lo que buscaste.</Vacio>
          )}
          <div className="clases">
            {visibles.map((c) => (
              <TarjetaClase
                key={c.id}
                clase={c}
                resumen={resumen[c.id]}
                grupos={proyectos.filter((p) => p.area?.id === c.id)}
              />
            ))}
          </div>
        </>
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

/** Una clase como tarjeta estilo Classroom: banda con el nombre, código, números y estado. */
function TarjetaClase({ clase, resumen, grupos }) {
  const alumnos = grupos.reduce((n, p) => n + p.estudiantes.length, 0)
  return (
    <article className="clase-card">
      <div className="clase-card__banda">
        <h2 className="clase-card__nombre">
          <Link to={`/clases/${clase.id}`}>{clase.nombre}</Link>
        </h2>
        <p className="clase-card__sub">
          {grupos.length === 0 ? 'Todavía sin grupos' : plural(grupos.length, 'grupo')}
        </p>
      </div>

      <div className="clase-card__cuerpo">
        <div>
          <p className="etiqueta-mayus">Código de invitación</p>
          <ChipCodigo codigo={clase.codigo} />
        </div>

        <div className="clase-card__numeros">
          <div>
            <strong>{alumnos}</strong>
            <span>{alumnos === 1 ? 'Alumno' : 'Alumnos'}</span>
          </div>
          <div>
            <strong>{grupos.length}</strong>
            <span>{grupos.length === 1 ? 'Grupo' : 'Grupos'}</span>
          </div>
        </div>

        {resumen && resumen.grupos > 0 && (
          <div>
            <p className="etiqueta-mayus">Estado general de los grupos</p>
            <RepartoSemaforo clase={resumen} variante="chips" />
          </div>
        )}

        {resumen?.proximaSesion && (
          <div className="clase-card__sesion">
            <div>
              <p className="etiqueta-mayus">Próxima sesión</p>
              <strong>{diaYHora(resumen.proximaSesion.fechaHora)}</strong>
            </div>
            <BotonUnirse enlace={resumen.proximaSesion.enlace} chico />
          </div>
        )}
      </div>

      <div className="clase-card__pie">
        <Link to={`/clases/${clase.id}?pestana=trabajo`}>Ver trabajo de clase →</Link>
        <Link className="btn btn--sutil btn--chico" to={`/clases/${clase.id}`}>
          Abrir clase
        </Link>
      </div>
    </article>
  )
}
