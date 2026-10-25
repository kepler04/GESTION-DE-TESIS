import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  crearProyecto,
  gruposDeLaClase,
  listarAsesores,
  listarCarpetas,
  unirmeAGrupo,
  verInvitacion,
} from '../api/tesistrack'
import { useAuth } from '../auth/AuthContext'
import Icono from './Icono'

const VACIO = {
  paso: 'inicio',
  codigo: '',
  clase: null,
  modalidad: null,
  tieneTema: null,
  titulo: '',
  descripcion: '',
  privadoId: '',
}

const PASOS_CON_CODIGO = [
  { id: 'codigo', etiqueta: 'Código' },
  { id: 'modalidad', etiqueta: 'Modalidad' },
  { id: 'tema', etiqueta: 'Tema' },
  { id: 'confirmar', etiqueta: 'Confirmar' },
]
const PASOS_SIN_CODIGO = [
  { id: 'tema', etiqueta: 'Tema' },
  { id: 'confirmar', etiqueta: 'Confirmar' },
]

/**
 * El primer ingreso del estudiante, como un asistente de pasos (Decisión 29).
 *
 * Con código: **Código** (ve la clase y el profesor antes de confirmar) →
 * **Modalidad** (solo, o en grupo: sumarse a uno de la clase o crear uno nuevo) →
 * **Tema** (si ya lo tiene, o "por definir") → **Confirmar**. Termina en la clase,
 * en Trabajo de clase, con la carpeta Temas de tesis abierta si tiene material.
 *
 * No se crea nada hasta el último paso, salvo sumarse a un grupo que ya existe (el
 * tema es del grupo, así que no hay nada más que preguntar). El avance se guarda en
 * el navegador: si se cierra a mitad de camino, al volver retoma donde quedó.
 *
 * "Todavía no tengo código" sigue existiendo, como camino secundario: crea la tesis
 * sin clase y el Dashboard le ofrece sumarse cuando reciba el código. Ahí, y solo
 * ahí, se puede elegir un profesor particular por su nombre, entre quienes dan
 * asesorías privadas (Decisión 24).
 */
export default function PrimerosPasos({ onListo }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const clave = `tesistrack.asistente.${user?.id}`
  const [estado, setEstado] = useState(() => {
    try {
      return { ...VACIO, ...JSON.parse(localStorage.getItem(clave) ?? '{}') }
    } catch {
      return VACIO
    }
  })
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(estado))
    } catch {
      // Sin almacenamiento el asistente funciona igual; solo no retoma.
    }
  }, [clave, estado])

  const cambiar = (parcial) => {
    setError(null)
    setEstado((e) => ({ ...e, ...parcial }))
  }
  const ir = (paso) => cambiar({ paso })
  const conCodigo = Boolean(estado.clase)

  function terminar() {
    try {
      localStorage.removeItem(clave)
    } catch {
      // nada que limpiar
    }
  }

  /** Lleva a la clase, a Trabajo de clase, con Temas de tesis abierta si tiene material. */
  async function entrarALaClase(areaId) {
    let destino = `/clases/${areaId}?pestana=trabajo`
    try {
      const carpetas = await listarCarpetas(areaId)
      const temas = carpetas.find((c) => /tema/i.test(c.nombre) && c.materiales.length > 0)
      if (temas) destino += `&carpeta=${temas.id}`
    } catch {
      // Si no se pueden leer las carpetas, igual entra a la clase.
    }
    terminar()
    navigate(destino)
  }

  async function crear() {
    setOcupado(true)
    setError(null)
    try {
      const tesis = await crearProyecto({
        titulo: estado.tieneTema ? estado.titulo.trim() : null,
        descripcion: estado.tieneTema ? estado.descripcion.trim() || null : null,
        codigoInvitacion: conCodigo ? estado.codigo.trim() : null,
        asesorId: !conCodigo && estado.privadoId ? Number(estado.privadoId) : null,
        grupal: estado.modalidad === 'grupo',
      })
      if (tesis.area) {
        await entrarALaClase(tesis.area.id)
      } else {
        terminar()
        await onListo()
      }
    } catch (err) {
      setError(err.message)
      setOcupado(false)
    }
  }

  async function sumarme(grupo) {
    setOcupado(true)
    setError(null)
    try {
      const tesis = await unirmeAGrupo(grupo.proyectoId, estado.codigo.trim())
      await entrarALaClase(tesis.area.id)
    } catch (err) {
      setError(err.message)
      setOcupado(false)
    }
  }

  const pasos = estado.paso === 'inicio' ? null : conCodigo || estado.paso === 'codigo' ? PASOS_CON_CODIGO : PASOS_SIN_CODIGO
  // "grupos" es parte de Modalidad en el indicador de avance.
  const pasoVisible = estado.paso === 'grupos' ? 'modalidad' : estado.paso

  return (
    <div className="asistente" aria-live="polite">
      {pasos && <Stepper pasos={pasos} actual={pasoVisible} />}

      {error && (
        <p className="alerta" role="alert">
          {error}
        </p>
      )}

      {estado.paso === 'inicio' && (
        <Inicio
          onCodigo={() => ir('codigo')}
          onSinCodigo={() => cambiar({ paso: 'tema', clase: null, codigo: '', modalidad: 'solo' })}
        />
      )}
      {estado.paso === 'codigo' && (
        <PasoCodigo estado={estado} cambiar={cambiar} onVolver={() => ir('inicio')} />
      )}
      {estado.paso === 'modalidad' && (
        <PasoModalidad
          estado={estado}
          onElegir={(modalidad) => cambiar({ modalidad, paso: modalidad === 'grupo' ? 'grupos' : 'tema' })}
          onVolver={() => ir('codigo')}
        />
      )}
      {estado.paso === 'grupos' && (
        <PasoGrupos
          estado={estado}
          ocupado={ocupado}
          onSumarme={sumarme}
          onCrearGrupo={() => cambiar({ modalidad: 'grupo', paso: 'tema' })}
          onVolver={() => ir('modalidad')}
        />
      )}
      {estado.paso === 'tema' && (
        <PasoTema
          estado={estado}
          cambiar={cambiar}
          onSeguir={() => ir('confirmar')}
          onVolver={() => (conCodigo ? ir(estado.modalidad === 'grupo' ? 'grupos' : 'modalidad') : ir('inicio'))}
        />
      )}
      {estado.paso === 'confirmar' && (
        <PasoConfirmar
          estado={estado}
          cambiar={cambiar}
          ocupado={ocupado}
          onCrear={crear}
          onVolver={() => ir('tema')}
        />
      )}
    </div>
  )
}

function Stepper({ pasos, actual }) {
  const indice = pasos.findIndex((p) => p.id === actual)
  return (
    <ol className="stepper" aria-label="Pasos">
      {pasos.map((p, i) => {
        const estado = i < indice ? 'completado' : i === indice ? 'activo' : ''
        return (
          <li key={p.id} className={`stepper__paso ${estado ? `is-${estado}` : ''}`} aria-current={i === indice ? 'step' : undefined}>
            <span className="stepper__numero">{i < indice ? '✓' : i + 1}</span>
            <span className="stepper__titulo">{p.etiqueta}</span>
          </li>
        )
      })}
    </ol>
  )
}

function Inicio({ onCodigo, onSinCodigo }) {
  return (
    <section className="asistente__paso">
      <p className="primeros__hola">¿Es tu primera vez acá?</p>
      <h2 className="asistente__titulo">Empecemos por tu tesis</h2>
      <p className="asistente__texto">
        Si tu profesor te pasó el código de su clase, con eso entrás a ella, elegís si trabajás solo o
        en grupo, y listo.
      </p>
      <button type="button" className="tarjeta-opcion tarjeta-opcion--principal" onClick={onCodigo}>
        <span className="tarjeta-opcion__icono">
          <Icono nombre="clases" />
        </span>
        <span>
          <strong>Tengo un código de clase</strong>
          <span>Algo como TT-A49RH6. Te lo pasa tu profesor.</span>
        </span>
      </button>
      <button type="button" className="asistente__secundario" onClick={onSinCodigo}>
        Todavía no tengo código
      </button>
    </section>
  )
}

function PasoCodigo({ estado, cambiar, onVolver }) {
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState(null)

  async function buscar(e) {
    e.preventDefault()
    setError(null)
    setBuscando(true)
    try {
      cambiar({ clase: await verInvitacion(estado.codigo.trim()) })
    } catch (err) {
      cambiar({ clase: null })
      setError(err.message)
    } finally {
      setBuscando(false)
    }
  }

  return (
    <section className="asistente__paso">
      <h2 className="asistente__titulo">Ingresá el código de tu clase</h2>
      <p className="asistente__texto">
        Te lo pasa tu profesor: empieza con TT y tiene 6 caracteres. Antes de seguir te mostramos de
        qué clase es, para que confirmes que es la tuya.
      </p>
      <form onSubmit={buscar} className="asistente__codigo">
        <label className="sr-only" htmlFor="codigo-clase">
          Código de la clase
        </label>
        <input
          id="codigo-clase"
          value={estado.codigo}
          onChange={(e) => cambiar({ codigo: e.target.value.toUpperCase(), clase: null })}
          placeholder="TT-XXXXXX"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck="false"
          autoFocus
          required
        />
        <button type="submit" className="btn btn--sutil" disabled={buscando || !estado.codigo.trim()}>
          {buscando ? 'Buscando…' : 'Buscar'}
        </button>
      </form>
      {error && (
        <p className="alerta" role="alert">
          {error}
        </p>
      )}
      {estado.clase && (
        <div className="asistente__encontrada" role="status">
          <span className="asistente__ok">✓ Clase encontrada</span>
          <strong>{estado.clase.area}</strong>
          <span>Profesor: {estado.clase.asesor}</span>
        </div>
      )}
      <div className="asistente__acciones">
        <button type="button" className="btn btn--fantasma" onClick={onVolver}>
          ← Volver
        </button>
        <button
          type="button"
          className="btn btn--primario"
          disabled={!estado.clase}
          onClick={() => cambiar({ paso: 'modalidad' })}
        >
          Sí, es mi clase →
        </button>
      </div>
    </section>
  )
}

function PasoModalidad({ estado, onElegir, onVolver }) {
  return (
    <section className="asistente__paso">
      <h2 className="asistente__titulo">¿Vas a trabajar solo o en grupo?</h2>
      <p className="asistente__texto">En {estado.clase.area} los grupos son de hasta los integrantes que fijó tu profesor.</p>
      <div className="asistente__opciones" role="radiogroup" aria-label="Modalidad">
        <button
          type="button"
          role="radio"
          aria-checked={estado.modalidad === 'solo'}
          className={`tarjeta-opcion ${estado.modalidad === 'solo' ? 'is-elegida' : ''}`}
          onClick={() => onElegir('solo')}
        >
          <span className="tarjeta-opcion__icono">
            <Icono nombre="persona" />
          </span>
          <span>
            <strong>Solo</strong>
            <span>Tu tesis es individual.</span>
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={estado.modalidad === 'grupo'}
          className={`tarjeta-opcion ${estado.modalidad === 'grupo' ? 'is-elegida' : ''}`}
          onClick={() => onElegir('grupo')}
        >
          <span className="tarjeta-opcion__icono">
            <Icono nombre="personas" />
          </span>
          <span>
            <strong>En grupo</strong>
            <span>Te sumás a un grupo de la clase o creás uno nuevo.</span>
          </span>
        </button>
      </div>
      <div className="asistente__acciones">
        <button type="button" className="btn btn--fantasma" onClick={onVolver}>
          ← Volver
        </button>
      </div>
    </section>
  )
}

function PasoGrupos({ estado, ocupado, onSumarme, onCrearGrupo, onVolver }) {
  const [grupos, setGrupos] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false
    gruposDeLaClase(estado.codigo.trim())
      .then((g) => !cancelado && setGrupos(g))
      .catch((e) => !cancelado && setError(e.message))
    return () => {
      cancelado = true
    }
  }, [estado.codigo])

  return (
    <section className="asistente__paso">
      <h2 className="asistente__titulo">Elegí tu grupo</h2>
      <p className="asistente__texto">
        Estos son los grupos de {estado.clase.area}. Si tu grupo todavía no existe, crealo y tus
        compañeros se suman después.
      </p>
      {error && (
        <p className="alerta" role="alert">
          {error}
        </p>
      )}
      {grupos === null && !error && <p className="estado-carga">Cargando grupos…</p>}
      {grupos && grupos.length === 0 && <p className="tenue">Todavía no hay grupos en esta clase. Sé el primero.</p>}
      {grupos && grupos.length > 0 && (
        <ul className="grupos-abiertos">
          {grupos.map((g) => {
            const lleno = g.cupos <= 0
            return (
              <li key={g.proyectoId} className={`grupo-abierto ${lleno ? 'is-lleno' : ''}`}>
                <div>
                  <strong>{g.integrantes.join(', ')}</strong>
                  <span className="lista__meta">{g.tema ?? 'Tema por definir'}</span>
                  <span className="lista__meta">
                    {lleno
                      ? `Completo (${g.integrantes.length} de ${g.tope})`
                      : `${g.cupos} ${g.cupos === 1 ? 'lugar libre' : 'lugares libres'} de ${g.tope}`}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn--sutil btn--chico"
                  disabled={lleno || ocupado}
                  onClick={() => onSumarme(g)}
                  aria-label={lleno ? `El grupo de ${g.integrantes.join(', ')} está completo` : `Sumarme al grupo de ${g.integrantes.join(', ')}`}
                >
                  {lleno ? 'Completo' : 'Sumarme'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <button type="button" className="tarjeta-opcion" onClick={onCrearGrupo} disabled={ocupado}>
        <span className="tarjeta-opcion__icono">
          <Icono nombre="mas" />
        </span>
        <span>
          <strong>Crear un grupo nuevo</strong>
          <span>Empezás vos y tus compañeros se suman con el código de la clase.</span>
        </span>
      </button>
      <div className="asistente__acciones">
        <button type="button" className="btn btn--fantasma" onClick={onVolver} disabled={ocupado}>
          ← Volver
        </button>
      </div>
    </section>
  )
}

function PasoTema({ estado, cambiar, onSeguir, onVolver }) {
  const listo = estado.tieneTema === false || (estado.tieneTema === true && estado.titulo.trim())
  return (
    <section className="asistente__paso">
      <h2 className="asistente__titulo">¿Ya tenés tema de tesis?</h2>
      <div className="asistente__opciones" role="radiogroup" aria-label="¿Ya tenés tema?">
        <button
          type="button"
          role="radio"
          aria-checked={estado.tieneTema === true}
          className={`tarjeta-opcion ${estado.tieneTema === true ? 'is-elegida' : ''}`}
          onClick={() => cambiar({ tieneTema: true })}
        >
          <span>
            <strong>Sí</strong>
            <span>Lo escribo ahora (se puede ajustar después).</span>
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={estado.tieneTema === false}
          className={`tarjeta-opcion ${estado.tieneTema === false ? 'is-elegida' : ''}`}
          onClick={() => cambiar({ tieneTema: false })}
        >
          <span>
            <strong>Todavía no</strong>
            <span>Lo defino más adelante.</span>
          </span>
        </button>
      </div>

      {estado.tieneTema === true && (
        <div className="form asistente__form">
          <label>
            Tema de tu tesis
            <input
              value={estado.titulo}
              onChange={(e) => cambiar({ titulo: e.target.value })}
              maxLength={255}
              placeholder="Puede ser provisorio"
              autoFocus
            />
          </label>
          <label>
            Descripción <span className="tenue">(opcional)</span>
            <textarea rows={3} value={estado.descripcion} onChange={(e) => cambiar({ descripcion: e.target.value })} />
          </label>
        </div>
      )}
      {estado.tieneTema === false && (
        <div className="asistente__calma">
          <strong>No te apresures.</strong> Mirá los temas que propone tu profesor y definilo cuando estés
          listo.
        </div>
      )}

      <div className="asistente__acciones">
        <button type="button" className="btn btn--fantasma" onClick={onVolver}>
          ← Volver
        </button>
        <button type="button" className="btn btn--primario" disabled={!listo} onClick={onSeguir}>
          Continuar →
        </button>
      </div>
    </section>
  )
}

function PasoConfirmar({ estado, cambiar, ocupado, onCrear, onVolver }) {
  const conCodigo = Boolean(estado.clase)
  const [privados, setPrivados] = useState([])

  useEffect(() => {
    if (conCodigo) return
    // Solo los profesores que aceptaron dar asesorías privadas (Decisión 24).
    listarAsesores().then(setPrivados).catch(() => setPrivados([]))
  }, [conCodigo])

  return (
    <section className="asistente__paso">
      <h2 className="asistente__titulo">Revisá y confirmá</h2>
      <dl className="asistente__resumen">
        {conCodigo && (
          <>
            <div>
              <dt>Clase</dt>
              <dd>{estado.clase.area}</dd>
            </div>
            <div>
              <dt>Profesor</dt>
              <dd>{estado.clase.asesor}</dd>
            </div>
            <div>
              <dt>Modalidad</dt>
              <dd>{estado.modalidad === 'grupo' ? 'En grupo (grupo nuevo)' : 'Solo'}</dd>
            </div>
          </>
        )}
        <div>
          <dt>Tema</dt>
          <dd>{estado.tieneTema ? estado.titulo.trim() : <span className="tenue">Por definir</span>}</dd>
        </div>
      </dl>

      {!conCodigo && (
        <>
          <p className="asistente__texto">
            Tu tesis va a quedar sin clase por ahora. Cuando tu profesor te pase el código, el Inicio te
            ofrece sumarte.
          </p>
          {privados.length > 0 && (
            <label className="form asistente__form">
              <span>
                ¿Tenés un profesor particular? <span className="tenue">(opcional)</span>
              </span>
              <select value={estado.privadoId} onChange={(e) => cambiar({ privadoId: e.target.value })}>
                <option value="">No, espero el código de mi clase</option>
                {privados.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </>
      )}

      <div className="asistente__acciones">
        <button type="button" className="btn btn--fantasma" onClick={onVolver} disabled={ocupado}>
          ← Volver
        </button>
        <button type="button" className="btn btn--primario" onClick={onCrear} disabled={ocupado}>
          {ocupado ? 'Creando…' : conCodigo ? 'Entrar a la clase →' : 'Crear mi tesis'}
        </button>
      </div>
    </section>
  )
}
