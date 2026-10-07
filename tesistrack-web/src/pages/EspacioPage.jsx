import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { crearActividad, eliminarActividad, verEspacio, verTablero } from '../api/tesistrack'
import MaterialesEspacio from '../components/MaterialesEspacio'
import SesionesEspacio from '../components/SesionesEspacio'
import TableroSemaforo from '../components/TableroSemaforo'
import { Card, Cargando, ErrorMsg, PageHead } from '../components/ui'

/**
 * Un espacio de trabajo, visto como aula.
 *
 * **El asesor dueño** ve todo y lo edita: el código para invitar, las próximas
 * sesiones, los materiales en carpetas, el tablero de quién va cómo y las
 * actividades. **El estudiante** que tiene una tesis en el espacio ve solo las
 * sesiones y los materiales —y los descarga—; nunca el código (es la llave del
 * espacio), ni el tablero (compara a los asesorados entre sí).
 *
 * La actividad se deja una vez y le llega a todos los asesorados del espacio —y a
 * los que entren después—. Antes había que crear el mismo hito tesis por tesis.
 */
export default function EspacioPage() {
  const { areaId } = useParams()
  const [espacio, setEspacio] = useState(null)
  const [tablero, setTablero] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [copiado, setCopiado] = useState(false)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [guardando, setGuardando] = useState(false)

  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const info = await verEspacio(areaId)
      setEspacio(info)
      // El tablero es solo del dueño: a un estudiante la API le respondería 403.
      setTablero(info.propietario ? await verTablero(areaId) : null)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [areaId])

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
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(actividad) {
    setError(null)
    try {
      await eliminarActividad(areaId, actividad.id)
      await recargar()
    } catch (err) {
      setError(err.message)
    }
  }

  if (cargando && !espacio) return <Cargando />
  if (!espacio) return <ErrorMsg>{error ?? 'No se pudo cargar el espacio.'}</ErrorMsg>

  const { area, asesor, propietario } = espacio

  // Vista del estudiante (o del coordinador): solo lectura.
  if (!propietario) {
    return (
      <>
        <PageHead titulo={area.nombre} descripcion={`Espacio de ${asesor.name}`}>
          <Link className="btn btn--sutil" to="/panel">
            ← Dashboard
          </Link>
        </PageHead>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <SesionesEspacio areaId={areaId} editable={false} />
        <MaterialesEspacio areaId={areaId} editable={false} />
      </>
    )
  }

  const filas = tablero?.filas ?? []
  const actividades = tablero?.actividades ?? []

  return (
    <>
      <PageHead
        titulo={area.nombre}
        descripcion={
          filas.length === 0
            ? 'Todavía no se sumó nadie a este espacio.'
            : `${filas.length} ${filas.length === 1 ? 'asesorado' : 'asesorados'} · ${actividades.length} ${actividades.length === 1 ? 'actividad' : 'actividades'}`
        }
      >
        <Link className="btn btn--sutil" to="/proyectos">
          ← Mis espacios
        </Link>
        <button
          type="button"
          className="btn btn--primario"
          onClick={() => setMostrarForm((v) => !v)}
        >
          {mostrarForm ? 'Cancelar' : 'Nueva actividad'}
        </button>
      </PageHead>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <Card titulo="Código para invitar">
        <div className="carpeta__codigo-caja">
          <code className="carpeta__codigo">{area.codigo}</code>
          <button
            type="button"
            className="btn btn--sutil"
            onClick={() => {
              navigator.clipboard?.writeText(area.codigo)
              setCopiado(true)
              setTimeout(() => setCopiado(false), 1800)
            }}
          >
            {copiado ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
      </Card>

      <SesionesEspacio areaId={areaId} editable />

      <MaterialesEspacio areaId={areaId} editable />

      {mostrarForm && (
        <Card titulo="Nueva actividad">
          <form className="form" onSubmit={handleCrear}>
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
              <textarea
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </label>
            <label>
              Fecha límite <span className="tenue">(opcional)</span>
              <input
                type="date"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
              />
            </label>
            <p className="tenue">
              Le va a aparecer como hito a los {filas.length}{' '}
              {filas.length === 1 ? 'asesorado' : 'asesorados'} de este espacio, y también a quien
              se sume más adelante.
            </p>
            <div className="form__acciones">
              <button type="submit" className="btn btn--primario" disabled={guardando}>
                {guardando ? 'Repartiendo…' : 'Dejar actividad'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {tablero && (
        <Card titulo="Tablero">
          <TableroSemaforo tablero={tablero} />
        </Card>
      )}

      {actividades.length > 0 && (
        <Card titulo="Actividades del espacio">
          <ul className="lista">
            {actividades.map((a) => (
              <li key={a.id}>
                <div>
                  <strong>{a.nombre}</strong>
                  {a.descripcion && <span className="lista__meta">{a.descripcion}</span>}
                </div>
                <button
                  type="button"
                  className="btn btn--sutil"
                  onClick={() => handleEliminar(a)}
                  // Lo que ya tiene entregas no se borra: se desengancha.
                  title="Saca la actividad del espacio. Lo ya entregado se conserva."
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}
