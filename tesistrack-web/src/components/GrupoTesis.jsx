import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  descartarInvitacion,
  eliminarProyecto,
  invitacionesEnviadas,
  invitarAlGrupo,
  listarCandidatos,
  quitarEstudiante,
} from '../api/tesistrack'
import BorrarProyecto from './BorrarProyecto'
import ConfirmarAccion from './ConfirmarAccion'
import Integrantes from './Integrantes'
import UnirseConCodigo from './UnirseConCodigo'
import { Card, ErrorMsg, Vacio } from './ui'
import { iniciales, plural } from '../utils/formato'

/**
 * Mi tesis → Grupo: quiénes son, cuántos lugares quedan, invitar y salir.
 *
 * En una clase se invita **eligiendo de la lista de la clase** (Decisión 31): solo
 * aparecen compañeros que trabajan solos y todavía no entregaron nada, porque al
 * aceptar su tesis individual se borra. La invitación espera a que la acepten.
 *
 * Sin clase (una tesis privada o todavía sin código), se suma por correo como
 * siempre (Decisión 15), y se ofrece entrar a una clase con un código.
 */
export default function GrupoTesis({ proyecto, usuarioId, onCambio }) {
  const navigate = useNavigate()
  const [candidatos, setCandidatos] = useState(null)
  const [enviadas, setEnviadas] = useState([])
  const [error, setError] = useState(null)
  const [saliendo, setSaliendo] = useState(false)
  const [borrando, setBorrando] = useState(false)
  const [unirse, setUnirse] = useState(false)
  const enClase = Boolean(proyecto.area)
  const integrantes = proyecto.estudiantes
  const tope = proyecto.area?.topeGrupo
  const libres = enClase ? Math.max(0, tope - integrantes.length) : null

  const recargar = useCallback(async () => {
    if (!enClase) return
    try {
      const [c, e] = await Promise.all([listarCandidatos(proyecto.id), invitacionesEnviadas(proyecto.id)])
      setCandidatos(c)
      setEnviadas(e)
    } catch (err) {
      setError(err.message)
    }
  }, [enClase, proyecto.id])

  useEffect(() => {
    recargar()
  }, [recargar])

  async function invitar(c) {
    setError(null)
    try {
      await invitarAlGrupo(proyecto.id, c.id)
      await recargar()
    } catch (err) {
      setError(err.message)
    }
  }

  async function cancelar(inv) {
    setError(null)
    try {
      await descartarInvitacion(inv.id)
      await recargar()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!enClase) {
    return (
      <>
        <Integrantes proyecto={proyecto} usuarioId={usuarioId} onCambio={onCambio} />
        <Card titulo="Clase">
          {unirse ? (
            <UnirseConCodigo
              proyectoId={proyecto.id}
              onCerrar={() => setUnirse(false)}
              onUnido={async () => {
                setUnirse(false)
                await onCambio()
              }}
            />
          ) : (
            <Vacio
              icono="clases"
              cta={
                <button type="button" className="btn btn--primario" onClick={() => setUnirse(true)}>
                  Unirme con un código
                </button>
              }
            >
              Tu tesis todavía no está en una clase. Cuando tu profesor te pase el código, sumate desde
              acá.
            </Vacio>
          )}
        </Card>
        <ZonaBorrar onBorrar={() => setBorrando(true)} />
        {borrando && (
          <BorrarProyecto
            proyecto={proyecto}
            onCerrar={() => setBorrando(false)}
            onBorrado={async () => {
              await eliminarProyecto(proyecto.id)
              navigate('/panel', { replace: true })
            }}
          />
        )}
      </>
    )
  }

  return (
    <>
      {error && <ErrorMsg>{error}</ErrorMsg>}

      <Card
        titulo={integrantes.length === 1 ? 'Integrante' : `Integrantes (${integrantes.length})`}
        accion={
          <span className={`cuenta-chip ${libres === 0 ? 'cuenta-chip--aviso' : ''}`}>
            {libres === 0 ? 'Grupo completo' : `${plural(libres, 'lugar libre', 'lugares libres')} de ${tope}`}
          </span>
        }
      >
        <ul className="grupo__alumnos">
          {integrantes.map((e) => (
            <li key={e.id}>
              <span className="persona__avatar persona__avatar--chico" aria-hidden="true">
                {iniciales(e.name)}
              </span>
              <div>
                <strong>{e.name}</strong>
                <span className="lista__meta">{e.email}</span>
              </div>
              {e.id === usuarioId && integrantes.length > 1 && (
                <button type="button" className="btn btn--fantasma btn--chico persona__mensaje" onClick={() => setSaliendo(true)}>
                  Salir del grupo
                </button>
              )}
            </li>
          ))}
        </ul>
        {integrantes.length === 1 && (
          <p className="tenue grupo__nota">
            Sos la única persona en esta tesis, así que no podés salir: la tesis quedaría sin nadie.
          </p>
        )}
      </Card>

      <Card titulo="Invitar a un compañero de la clase">
        {libres === 0 ? (
          <Vacio icono="personas">El grupo está completo: la clase admite hasta {tope} integrantes.</Vacio>
        ) : candidatos === null ? (
          <p className="estado-carga">Cargando compañeros…</p>
        ) : candidatos.length === 0 ? (
          <Vacio icono="personas">
            Nadie de la clase trabaja solo sin entregas por ahora. Tus compañeros también pueden sumarse
            al grupo con el código de la clase.
          </Vacio>
        ) : (
          <>
            <p className="tenue">
              Aparecen quienes trabajan solos y todavía no entregaron nada. Si aceptan, pasan a tu grupo
              y su tesis individual (vacía) se borra.
              {!proyecto.grupal && ' Tu tesis pasa a ser grupal.'}
            </p>
            <ul className="lista">
              {candidatos.map((c) => (
                <li key={c.id}>
                  <div>
                    <strong>{c.nombre}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn btn--sutil btn--chico"
                    disabled={c.invitado}
                    onClick={() => invitar(c)}
                  >
                    {c.invitado ? 'Invitación enviada' : 'Invitar'}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        {enviadas.length > 0 && (
          <>
            <p className="etiqueta-mayus grupo__enviadas">Esperando respuesta</p>
            <ul className="lista">
              {enviadas.map((i) => (
                <li key={i.id}>
                  <div>
                    <strong>{i.invitado}</strong>
                    <span className="lista__meta">Invitado por {i.invitador}</span>
                  </div>
                  <button type="button" className="btn btn--fantasma btn--chico" onClick={() => cancelar(i)}>
                    Cancelar invitación
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <ZonaBorrar onBorrar={() => setBorrando(true)} />
      {borrando && (
        <BorrarProyecto
          proyecto={proyecto}
          onCerrar={() => setBorrando(false)}
          onBorrado={async () => {
            await eliminarProyecto(proyecto.id)
            navigate('/panel', { replace: true })
          }}
        />
      )}

      {saliendo && (
        <ConfirmarAccion
          titulo="Salir del grupo"
          etiquetaConfirmar="Salir del grupo"
          onCerrar={() => setSaliendo(false)}
          onConfirmar={async () => {
            await quitarEstudiante(proyecto.id, usuarioId)
            setSaliendo(false)
            navigate('/panel', { replace: true })
          }}
        >
          <p>
            Vas a salir del grupo de <strong>{integrantes.filter((e) => e.id !== usuarioId).map((e) => e.name).join(' y ')}</strong>.
          </p>
          <p>
            La tesis sigue siendo de ellos, con sus entregas y observaciones: vos dejás de verla. Para
            volver a la clase vas a necesitar el código y armar tu tesis de nuevo.
          </p>
        </ConfirmarAccion>
      )}
    </>
  )
}

function ZonaBorrar({ onBorrar }) {
  return (
    <section className="zona-peligro" aria-labelledby="borrar-tesis-titulo">
      <h2 id="borrar-tesis-titulo" className="zona-peligro__titulo">
        Zona de peligro
      </h2>
      <div className="zona-peligro__fila">
        <div>
          <strong>Borrar esta tesis</strong>
          <p className="lista__meta">Se borran sus hitos, entregas, observaciones y asesorías. No se puede deshacer.</p>
        </div>
        <button type="button" className="btn btn--peligro" onClick={onBorrar}>
          Borrar tesis
        </button>
      </div>
    </section>
  )
}
