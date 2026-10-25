import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import EstadoBadge from '../components/EstadoBadge'
import GrupoTesis from '../components/GrupoTesis'
import Icono from '../components/Icono'
import PrimerosPasos from '../components/PrimerosPasos'
import RegistrarTema from '../components/RegistrarTema'
import { PestanaContext } from '../components/pestanaContext'
import { Cargando, SelectorProyecto } from '../components/ui'
import useMigas from '../hooks/useMigas'
import useProyectoActivo from '../hooks/useProyectoActivo'
import AsesoriasPage from './AsesoriasPage'
import EntregasPage from './EntregasPage'
import HitosPage from './HitosPage'
import ObservacionesPage from './ObservacionesPage'
import TareasPage from './TareasPage'

const PESTANAS_TESIS = [
  { id: 'hitos', etiqueta: 'Hitos', icono: 'hitos' },
  { id: 'entregas', etiqueta: 'Entregas', icono: 'entregas' },
  { id: 'observaciones', etiqueta: 'Observaciones', icono: 'observaciones' },
  { id: 'tareas', etiqueta: 'Tareas', icono: 'tareas' },
  { id: 'asesorias', etiqueta: 'Asesorías', icono: 'calendario' },
  { id: 'grupo', etiqueta: 'Grupo', icono: 'personas' },
]

/**
 * Mi tesis: todo lo de la tesis del estudiante en un solo lugar, con pestañas
 * (Decisión 32). Antes eran seis entradas sueltas del menú.
 *
 * Arriba, el tema (o "Tema por definir" con el botón para registrarlo), la clase y
 * el profesor. Cada pestaña es la pantalla de siempre (Hitos, Entregas…): adentro de
 * Mi tesis pierde su título y su selector de tesis, que ya están arriba, y conserva
 * sus botones. La pestaña vive en la URL (`?pestana=`), y las rutas viejas
 * (`/entregas?hito=…`) redirigen acá con sus parámetros.
 */
export default function MiTesisPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const { proyectos, activoId, activo, seleccionar, recargar, cargando } = useProyectoActivo()
  const [registrando, setRegistrando] = useState(false)
  const pedida = params.get('pestana')
  const activa = PESTANAS_TESIS.some((p) => p.id === pedida) ? pedida : 'hitos'

  useMigas([{ texto: 'Tesis Track', a: '/panel' }, { texto: 'Mi tesis' }])

  if (cargando) return <Cargando />
  if (!activo) return <PrimerosPasos onListo={recargar} />

  function elegir(id) {
    // Al cambiar de pestaña se sueltan los parámetros de la anterior (hito, corregir).
    setParams(id === 'hitos' ? {} : { pestana: id })
  }

  const esIntegrante = activo.estudiantes.some((e) => e.id === user?.id)

  return (
    <>
      <header className="tesis-cabecera">
        <div>
          <p className="etiqueta-mayus">{activo.estudiantes.length > 1 ? `Grupo de ${activo.estudiantes.length}` : 'Tesis individual'}</p>
          <h1>{activo.titulo || <span className="tesis-portada__sin-tema">Tema por definir</span>}</h1>
          <p className="tesis-cabecera__meta">
            {activo.asesor ? <>Profesor: <strong>{activo.asesor.name}</strong></> : 'Todavía sin profesor'}
            {activo.area && (
              <>
                {' · '}
                <Link to={`/clases/${activo.area.id}`}>{activo.area.nombre}</Link>
              </>
            )}
          </p>
        </div>
        <div className="tesis-cabecera__acciones">
          <SelectorProyecto proyectos={proyectos} activoId={activoId} onChange={seleccionar} />
          {esIntegrante && (
            <button
              type="button"
              className={`btn ${activo.titulo ? 'btn--sutil' : 'btn--primario'}`}
              onClick={() => setRegistrando(true)}
            >
              {activo.titulo ? 'Cambiar tema' : 'Registrar mi tema'}
            </button>
          )}
          {activo.estado && activo.estado !== 'EN_CURSO' && <EstadoBadge estado={activo.estado} tipo="proyecto" />}
        </div>
      </header>

      <div className="pestanas" role="tablist" aria-label="Secciones de tu tesis">
        {PESTANAS_TESIS.map((p) => (
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

      <div role="tabpanel" id={`panel-${activa}`} aria-labelledby={`pestana-${activa}`} key={`${activoId}-${activa}`}>
        <PestanaContext.Provider value={true}>
          {activa === 'hitos' && <HitosPage />}
          {activa === 'entregas' && <EntregasPage />}
          {activa === 'observaciones' && <ObservacionesPage />}
          {activa === 'tareas' && <TareasPage />}
          {activa === 'asesorias' && <AsesoriasPage />}
          {activa === 'grupo' && <GrupoTesis proyecto={activo} usuarioId={user?.id} onCambio={recargar} />}
        </PestanaContext.Provider>
      </div>

      {registrando && (
        <RegistrarTema
          proyecto={activo}
          onCerrar={() => setRegistrando(false)}
          onListo={async () => {
            setRegistrando(false)
            await recargar()
          }}
        />
      )}
    </>
  )
}
