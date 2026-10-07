import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { listarActividades, resumenEspacio, verEspacio, verTablero } from '../api/tesistrack'
import ActividadesClase from '../components/ActividadesClase'
import AvisosClase from '../components/AvisosClase'
import ConfiguracionClase from '../components/ConfiguracionClase'
import Icono from '../components/Icono'
import MaterialesEspacio from '../components/MaterialesEspacio'
import PersonasClase from '../components/PersonasClase'
import SesionesEspacio from '../components/SesionesEspacio'
import TableroSemaforo from '../components/TableroSemaforo'
import { Card, Cargando, ChipCodigo, ErrorMsg, fecha } from '../components/ui'
import useMigas from '../hooks/useMigas'
import { diasHasta, plural } from '../utils/formato'

const TABS_ESTUDIANTE = [
  { id: 'tablon', etiqueta: 'Tablón', icono: 'tablon' },
  { id: 'trabajo', etiqueta: 'Trabajo de clase', icono: 'carpeta' },
  { id: 'personas', etiqueta: 'Personas', icono: 'personas' },
]

const TABS_PROFESOR = [
  ...TABS_ESTUDIANTE,
  { id: 'seguimiento', etiqueta: 'Seguimiento', icono: 'tabla' },
  { id: 'configuracion', etiqueta: 'Configuración', icono: 'ajustes' },
]

/**
 * La clase como un salón completo, con pestañas al estilo Classroom.
 *
 * - **Tablón**: las próximas sesiones y la próxima actividad a un costado; los
 *   avisos al centro.
 * - **Trabajo de clase**: las actividades en orden de fecha y las carpetas de
 *   materiales.
 * - **Personas**: el profesor y los alumnos agrupados por grupo.
 * - **Seguimiento** (solo el profesor): la matriz con semáforo.
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

  const nombreClase = espacio?.area?.nombre
  useMigas(
    nombreClase
      ? [
          { texto: 'Tesis Track', a: '/panel' },
          ...(espacio.propietario ? [{ texto: 'Mis clases', a: '/clases' }] : []),
          { texto: nombreClase },
        ]
      : null,
  )

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
      <header className="clase-portada">
        <div>
          <h1>{area.nombre}</h1>
          <p>
            Profesor: <strong>{asesor.name}</strong>
            {propietario && resumen && (
              <>
                {' '}
                · {plural(resumen.tesis, 'grupo')} ·{' '}
                {plural(resumen.actividades, 'actividad', 'actividades')}
              </>
            )}
          </p>
        </div>
        {propietario && (
          <div className="clase-portada__codigo clase__codigo">
            <p className="etiqueta-mayus">Código de invitación</p>
            <ChipCodigo codigo={area.codigo} grande />
          </div>
        )}
      </header>

      {error && <ErrorMsg>{error}</ErrorMsg>}

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
            <Icono nombre={p.icono} />
            {p.etiqueta}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${activa}`} aria-labelledby={`pestana-${activa}`}>
        {activa === 'tablon' && (
          <div className="tablon">
            <div className="tablon__lateral">
              <SesionesEspacio areaId={areaId} editable={propietario} />
              <ProximaActividad areaId={areaId} />
            </div>
            <AvisosClase areaId={areaId} editable={propietario} profesor={asesor.name} />
          </div>
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

/**
 * La actividad que vence primero entre las que todavía no vencieron. Si ninguna
 * tiene fecha (o todas pasaron), no se muestra: un "próximo hito" vacío no ayuda.
 */
function ProximaActividad({ areaId }) {
  const [actividades, setActividades] = useState(null)

  useEffect(() => {
    let cancelado = false
    listarActividades(areaId)
      .then((lista) => !cancelado && setActividades(lista))
      .catch(() => !cancelado && setActividades([]))
    return () => {
      cancelado = true
    }
  }, [areaId])

  if (!actividades) return null
  const proxima = actividades
    .filter((a) => a.fechaLimite && diasHasta(a.fechaLimite) >= 0)
    .sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite))[0]
  if (!proxima) return null

  const dias = diasHasta(proxima.fechaLimite)
  return (
    <Card
      titulo={
        <>
          <span className="card__titulo-icono">
            <Icono nombre="reloj" />
          </span>
          Próxima actividad
        </>
      }
    >
      <div className="proximo">
        <strong className="proximo__titulo">{proxima.nombre}</strong>
        <span className="proximo__meta">Fecha límite: {fecha(proxima.fechaLimite)}</span>
        <span className={`badge proximo__plazo ${dias <= 3 ? 'badge--aviso' : 'badge--proceso'}`}>
          <span className="badge__icono" aria-hidden="true">
            {dias <= 3 ? '⚠' : '◐'}
          </span>
          {dias === 0 ? 'Vence hoy' : dias === 1 ? 'Vence mañana' : `Faltan ${dias} días`}
        </span>
        <Link className="btn btn--sutil" to={`/clases/${areaId}?pestana=trabajo`}>
          Ver trabajo de clase
        </Link>
      </div>
    </Card>
  )
}

/** La matriz con semáforo: una fila por grupo, una columna por actividad. */
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
