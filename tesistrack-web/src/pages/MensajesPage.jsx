import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  enviarMensaje,
  listarContactos,
  listarConversaciones,
  marcarMensajesLeidos,
  verConversacion,
} from '../api/tesistrack'
import { useAuth } from '../auth/AuthContext'
import Icono from '../components/Icono'
import { Cargando, ErrorMsg, PageHead, Vacio } from '../components/ui'
import { iniciales } from '../utils/formato'

/** Cada cuánto se buscan mensajes nuevos con la pantalla abierta. */
const REFRESCO_MS = 10000
const MAXIMO = 2000

/**
 * Mensajes privados uno a uno (Decisión 28).
 *
 * El estudiante le escribe a su profesor y a sus compañeros de grupo; el profesor, a
 * sus alumnos. La lista de "a quién" la decide el backend con la tesis compartida:
 * acá solo se muestra lo que llega.
 *
 * No hay notificaciones en tiempo real: con la pantalla abierta se buscan mensajes
 * nuevos cada 10 segundos (y solo si la pestaña está a la vista), y el número del
 * menú se actualiza cada 30. Para un curso alcanza y no suma infraestructura.
 *
 * La conversación abierta vive en la URL (`?con=`): un botón "Mensaje" de otra
 * pantalla puede llevar directo a ella.
 */
export default function MensajesPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const abierta = Number(params.get('con')) || null
  const [conversaciones, setConversaciones] = useState(null)
  const [contactos, setContactos] = useState(null)
  const [error, setError] = useState(null)
  const [eligiendo, setEligiendo] = useState(false)

  const recargarBandeja = useCallback(
    () =>
      Promise.all([listarConversaciones(), listarContactos()])
        .then(([c, k]) => {
          setConversaciones(c)
          setContactos(k)
        })
        .catch((e) => setError(e.message)),
    [],
  )

  useEffect(() => {
    recargarBandeja()
    const reloj = setInterval(() => document.visibilityState === 'visible' && recargarBandeja(), REFRESCO_MS)
    return () => clearInterval(reloj)
  }, [recargarBandeja])

  if (user?.role === 'COORDINADOR') {
    return (
      <>
        <PageHead titulo="Mensajes" />
        <Vacio icono="mensaje">Los mensajes privados son entre profesores y estudiantes.</Vacio>
      </>
    )
  }

  if (error && !conversaciones) return <ErrorMsg>{error}</ErrorMsg>
  if (!conversaciones || !contactos) return <Cargando />

  const abrir = (id) => {
    setEligiendo(false)
    setParams(id ? { con: String(id) } : {})
  }
  // Contactos con los que todavía no hay conversación: los del "Nuevo mensaje".
  const sinConversacion = contactos.filter((k) => !conversaciones.some((c) => c.contacto.id === k.id))

  return (
    <>
      <PageHead
        titulo="Mensajes"
        descripcion={
          user?.role === 'ASESOR'
            ? 'Conversaciones privadas con tus alumnos.'
            : 'Conversaciones privadas con tu profesor y tus compañeros de grupo.'
        }
      />

      <div className={`mensajeria ${abierta ? 'mensajeria--con-hilo' : ''}`}>
        <aside className="bandeja" aria-label="Conversaciones">
          <div className="bandeja__cabecera">
            <button
              type="button"
              className="btn btn--primario btn--chico"
              onClick={() => setEligiendo((v) => !v)}
              disabled={contactos.length === 0}
            >
              <Icono nombre="mas" />
              Nuevo mensaje
            </button>
          </div>

          {eligiendo && (
            <div className="bandeja__contactos">
              <p className="etiqueta-mayus">¿A quién le escribís?</p>
              {sinConversacion.length === 0 ? (
                <p className="tenue">Ya tenés una conversación con todos tus contactos: elegila de la lista.</p>
              ) : (
                <ul>
                  {sinConversacion.map((k) => (
                    <li key={k.id}>
                      <button type="button" className="bandeja__item" onClick={() => abrir(k.id)}>
                        <span className="avatar avatar--chico" aria-hidden="true">
                          {iniciales(k.nombre)}
                        </span>
                        <span className="bandeja__texto">
                          <strong>{k.nombre}</strong>
                          <span>{k.relacion}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {conversaciones.length === 0 ? (
            <div className="bandeja__vacia">
              <Vacio icono="mensaje">
                {contactos.length === 0
                  ? user?.role === 'ASESOR'
                    ? 'Cuando tengas alumnos en tus clases vas a poder escribirles acá.'
                    : 'Cuando tu tesis tenga profesor o compañeros de grupo vas a poder escribirles acá.'
                  : 'Todavía no hay conversaciones. Empezá una con “Nuevo mensaje”.'}
              </Vacio>
            </div>
          ) : (
            <ul className="bandeja__lista">
              {conversaciones.map((c) => (
                <li key={c.contacto.id}>
                  <button
                    type="button"
                    className={`bandeja__item ${abierta === c.contacto.id ? 'is-activa' : ''}`}
                    onClick={() => abrir(c.contacto.id)}
                    aria-current={abierta === c.contacto.id ? 'true' : undefined}
                  >
                    <span className="avatar avatar--chico" aria-hidden="true">
                      {iniciales(c.contacto.nombre)}
                    </span>
                    <span className="bandeja__texto">
                      <span className="bandeja__fila">
                        <strong>{c.contacto.nombre}</strong>
                        <time dateTime={c.ultimoFecha}>{cuando(c.ultimoFecha)}</time>
                      </span>
                      <span className="bandeja__fila">
                        <span className={`bandeja__ultimo ${c.noLeidos > 0 ? 'is-nuevo' : ''}`}>
                          {c.ultimoPropio && 'Vos: '}
                          {c.ultimoTexto}
                        </span>
                        {c.noLeidos > 0 && (
                          <span className="bandeja__no-leidos">
                            {c.noLeidos}
                            <span className="sr-only"> sin leer</span>
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="chat" aria-label="Conversación">
          {abierta ? (
            <Hilo key={abierta} otroId={abierta} onCambio={recargarBandeja} onVolver={() => abrir(null)} />
          ) : (
            <div className="chat__vacio">
              <Vacio icono="mensaje">Elegí una conversación o empezá una nueva.</Vacio>
            </div>
          )}
        </section>
      </div>
    </>
  )
}

/** Una conversación abierta: los mensajes y la caja para escribir. */
function Hilo({ otroId, onCambio, onVolver }) {
  const [hilo, setHilo] = useState(null)
  const [error, setError] = useState(null)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const fin = useRef(null)
  const cantidad = useRef(0)

  const cargar = useCallback(async () => {
    try {
      const h = await verConversacion(otroId)
      setHilo(h)
      setError(null)
      // Abrir la conversación es leer lo que llegó: se marca y se avisa al menú.
      if (h.mensajes.some((m) => !m.propio && !m.leidoAt)) {
        await marcarMensajesLeidos(otroId)
        window.dispatchEvent(new Event('mensajes:leidos'))
        onCambio()
      }
    } catch (e) {
      setError(e.message)
    }
  }, [otroId, onCambio])

  useEffect(() => {
    cargar()
    const reloj = setInterval(() => document.visibilityState === 'visible' && cargar(), REFRESCO_MS)
    return () => clearInterval(reloj)
  }, [cargar])

  // Baja al último mensaje solo cuando llega uno nuevo, no en cada refresco.
  useEffect(() => {
    const n = hilo?.mensajes.length ?? 0
    if (n !== cantidad.current) {
      cantidad.current = n
      fin.current?.scrollIntoView({ block: 'end' })
    }
  }, [hilo])

  async function handleEnviar(e) {
    e?.preventDefault()
    const limpio = texto.trim()
    if (!limpio || enviando) return
    setEnviando(true)
    setError(null)
    try {
      await enviarMensaje(otroId, limpio)
      setTexto('')
      await cargar()
      onCambio()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (!hilo && error) {
    return (
      <div className="chat__vacio">
        <ErrorMsg>{error}</ErrorMsg>
      </div>
    )
  }
  if (!hilo) return <Cargando />

  const { contacto, puedeEscribir, mensajes } = hilo
  const ultimoPropio = [...mensajes].reverse().find((m) => m.propio)

  return (
    <>
      <header className="chat__cabecera">
        <button type="button" className="chat__volver" onClick={onVolver} aria-label="Volver a las conversaciones">
          <Icono nombre="volver" />
        </button>
        <span className="avatar" aria-hidden="true">
          {iniciales(contacto.nombre)}
        </span>
        <div>
          <h2>{contacto.nombre}</h2>
          <p>{contacto.relacion}</p>
        </div>
      </header>

      <ol className="chat__mensajes" aria-live="polite">
        {mensajes.length === 0 && (
          <li className="chat__inicio">
            Este es el comienzo de tu conversación con {contacto.nombre}. Solo la ven ustedes dos.
          </li>
        )}
        {mensajes.map((m, i) => {
          const nuevoDia = i === 0 || dia(mensajes[i - 1].createdAt) !== dia(m.createdAt)
          return (
            <li key={m.id} className={`burbuja-fila ${m.propio ? 'is-propia' : ''}`}>
              {nuevoDia && <p className="chat__dia">{dia(m.createdAt)}</p>}
              <div className="burbuja">
                <span className="sr-only">{m.propio ? 'Vos' : contacto.nombre}: </span>
                <p>{m.texto}</p>
                <time dateTime={m.createdAt}>
                  {new Date(m.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  {m === ultimoPropio && m.leidoAt && ' · Visto'}
                </time>
              </div>
            </li>
          )
        })}
        <li ref={fin} aria-hidden="true" />
      </ol>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {puedeEscribir ? (
        <form className="chat__escribir" onSubmit={handleEnviar}>
          <label className="sr-only" htmlFor="mensaje-nuevo">
            Mensaje para {contacto.nombre}
          </label>
          <textarea
            id="mensaje-nuevo"
            rows={2}
            value={texto}
            maxLength={MAXIMO}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              // Enter envía; Shift+Enter hace un salto de línea.
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                handleEnviar()
              }
            }}
            placeholder={`Escribile a ${contacto.nombre}…`}
          />
          <div className="chat__acciones">
            <span className="tenue">
              {texto.length > MAXIMO - 200 ? `${MAXIMO - texto.length} caracteres disponibles` : 'Enter para enviar · Shift+Enter para otra línea'}
            </span>
            <button type="submit" className="btn btn--primario btn--chico" disabled={enviando || !texto.trim()}>
              <Icono nombre="enviar" />
              {enviando ? 'Enviando…' : 'Enviar'}
            </button>
          </div>
        </form>
      ) : (
        <p className="chat__cerrado">
          Ya no comparten tesis ni clase: la conversación queda guardada, pero no se pueden mandar
          mensajes nuevos.{' '}
          <Link to="/panel">Ir al Dashboard</Link>
        </p>
      )}
    </>
  )
}

/** "18:04" si fue hoy, "ayer", o "7 oct". */
function cuando(valor) {
  const d = new Date(valor)
  const hoy = new Date()
  if (d.toDateString() === hoy.toDateString()) {
    return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  }
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)
  if (d.toDateString() === ayer.toDateString()) return 'ayer'
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

/** "hoy", "ayer" o "martes 7 de octubre": el separador entre días de la conversación. */
function dia(valor) {
  const d = new Date(valor)
  const hoy = new Date()
  if (d.toDateString() === hoy.toDateString()) return 'Hoy'
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)
  if (d.toDateString() === ayer.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
}
