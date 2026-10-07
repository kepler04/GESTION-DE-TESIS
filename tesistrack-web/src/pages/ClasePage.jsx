import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { resumenEspacio, verEspacio, verTablero } from '../api/tesistrack'
import ActividadesClase from '../components/ActividadesClase'
import AvisosClase from '../components/AvisosClase'
import ConfiguracionClase from '../components/ConfiguracionClase'
import MaterialesEspacio from '../components/MaterialesEspacio'
import PersonasClase from '../components/PersonasClase'
import SesionesEspacio from '../components/SesionesEspacio'
import TableroSemaforo from '../components/TableroSemaforo'
import { Card, Cargando, ErrorMsg, PageHead } from '../components/ui'
import { plural } from '../utils/formato'

const TABS_ESTUDIANTE = [
  { id: 'tablon', etiqueta: 'Tablón' },
  { id: 'trabajo', etiqueta: 'Trabajo de clase' },
  { id: 'personas', etiqueta: 'Personas' },
]

const TABS_PROFESOR = [
  ...TABS_ESTUDIANTE,
  { id: 'seguimiento', etiqueta: 'Seguimiento' },
  { id: 'configuracion', etiqueta: 'Configuración' },
]

/**
 * La clase como un salón completo, con pestañas al estilo Classroom.
 *
 * - **Tablón**: los avisos y las próximas sesiones.
 * - **Trabajo de clase**: las actividades y las carpetas de materiales.
 * - **Personas**: el profesor y los alumnos agrupados por grupo.
 * - **Seguimiento** (solo el profesor): el tablero con semáforo.
 * - **Configuración** (solo el profesor): nombre, código y borrar la clase.
 *
 * El estudiante ve las tres primeras; Seguimiento y Configuración ni aparecen. El
 * backend lo impone igual (el tablero y los cambios dan 403): esconder la pestaña es
 * solo cortesía.
 *
 * La pestaña activa vive en la URL (`?pestana=`), así un enlace puede llevar directo
 * a Seguimiento y "atrás" del navegador vuelve a la pestaña anterior.
 */
export default function ClasePage() {
  const { areaId } = useParams()
  const [params, setParams] = useSearchParams()
  const [espacio, setEspacio] = useState(null)
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [copiado, setCopiado] = useState(false)

  const recargar = useCallback(async () => {
    setError(null)
    try {
      const info = await verEspacio(areaId)
      setEspacio(info)
      // El resumen (cuántos grupos y actividades) es solo del dueño.
      setResumen(info.propietario ? await resumenEspacio(areaId) : null)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [areaId])

  useEffect(() => {
    setCargando(true)
    recargar()
  }, [recargar])

  if (cargando) return <Cargando />
  if (!espacio) return <ErrorMsg>{error ?? 'No se pudo cargar la clase.'}</ErrorMsg>

  const { area, asesor, propietario } = espacio
  const pestanas = propietario ? TABS_PROFESOR : TABS_ESTUDIANTE
  const pedida = params.get('pestana')
  // Una pestaña que no existe (o que no le corresponde) cae en el Tablón.
  const activa = pestanas.some((p) => p.id === pedida) ? pedida : 'tablon'

  function elegir(id) {
    setParams(id === 'tablon' ? {} : { pestana: id })
  }

  return (
    <>
      <PageHead
        titulo={area.nombre}
        descripcion={
          propietario && resumen
            ? `${plural(resumen.tesis, 'grupo')} · ${plural(resumen.actividades, 'actividad', 'actividades')}`
            : `Clase de ${asesor.name}`
        }
      >
        <Link className="btn btn--sutil" to={propietario ? '/clases' : '/panel'}>
          {propietario ? '← Mis clases' : '← Dashboard'}
        </Link>
      </PageHead>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {propietario && (
        <div className="clase__codigo">
          <span className="tenue">Código para invitar</span>
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
      )}

      <div className="pestanas" role="tablist" aria-label="Secciones de la clase">
        {pestanas.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`pestana-${p.id}`}
            aria-selected={activa === p.id}
            aria-controls={`panel-${p.id}`}
            className={`pestana ${activa === p.id ? 'is-activa' : ''}`}
            onClick={() => elegir(p.id)}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${activa}`} aria-labelledby={`pestana-${activa}`}>
        {activa === 'tablon' && (
          <>
            <AvisosClase areaId={areaId} editable={propietario} />
            <SesionesEspacio areaId={areaId} editable={propietario} />
          </>
        )}

        {activa === 'trabajo' && (
          <>
            <ActividadesClase areaId={areaId} editable={propietario} onCambio={recargar} />
            <MaterialesEspacio areaId={areaId} editable={propietario} />
          </>
        )}

        {activa === 'personas' && (
          <PersonasClase areaId={areaId} claseNombre={area.nombre} onCambio={recargar} />
        )}

        {activa === 'seguimiento' && propietario && <Seguimiento areaId={areaId} />}

        {activa === 'configuracion' && propietario && (
          <ConfiguracionClase area={area} onCambio={recargar} />
        )}
      </div>
    </>
  )
}

/** El tablero con semáforo: una fila por grupo, una columna por actividad. */
function Seguimiento({ areaId }) {
  const [tablero, setTablero] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    verTablero(areaId)
      .then(setTablero)
      .catch((e) => setError(e.message))
  }, [areaId])

  if (error) return <ErrorMsg>{error}</ErrorMsg>
  if (!tablero) return <Cargando />

  return (
    <Card titulo="Seguimiento">
      <TableroSemaforo tablero={tablero} />
    </Card>
  )
}
