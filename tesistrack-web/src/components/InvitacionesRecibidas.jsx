import { useCallback, useEffect, useState } from 'react'
import { aceptarInvitacion, descartarInvitacion, invitacionesRecibidas } from '../api/tesistrack'
import ConfirmarAccion from './ConfirmarAccion'
import Icono from './Icono'
import { ErrorMsg } from './ui'

/**
 * Las invitaciones a un grupo que recibió el estudiante (Decisión 31). Aceptar lo
 * pasa al grupo y borra su tesis individual de esa clase, que está vacía: por eso se
 * confirma diciendo exactamente eso.
 */
export default function InvitacionesRecibidas({ onCambio }) {
  const [lista, setLista] = useState([])
  const [error, setError] = useState(null)
  const [aceptando, setAceptando] = useState(null)

  const recargar = useCallback(
    () =>
      invitacionesRecibidas()
        .then(setLista)
        .catch(() => setLista([])),
    [],
  )

  useEffect(() => {
    recargar()
  }, [recargar])

  async function rechazar(inv) {
    setError(null)
    try {
      await descartarInvitacion(inv.id)
      await recargar()
    } catch (err) {
      setError(err.message)
    }
  }

  if (lista.length === 0) return null

  return (
    <section className="invitaciones" aria-label="Invitaciones a un grupo">
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {lista.map((inv) => (
        <article key={inv.id} className="invitacion-grupo">
          <span className="accion-principal__icono" aria-hidden="true">
            <Icono nombre="personas" />
          </span>
          <div className="invitacion-grupo__cuerpo">
            <strong>{inv.invitador} te invitó a su grupo</strong>
            <span className="lista__meta">
              {inv.integrantes.join(', ')} · {inv.tema ?? 'Tema por definir'}
              {inv.clase && ` · ${inv.clase}`}
            </span>
          </div>
          <div className="acciones-fila">
            <button type="button" className="btn btn--primario btn--chico" onClick={() => setAceptando(inv)}>
              Aceptar
            </button>
            <button type="button" className="btn btn--sutil btn--chico" onClick={() => rechazar(inv)}>
              Rechazar
            </button>
          </div>
        </article>
      ))}

      {aceptando && (
        <ConfirmarAccion
          titulo="Sumarte al grupo"
          etiquetaConfirmar="Sí, sumarme"
          peligro={false}
          onCerrar={() => setAceptando(null)}
          onConfirmar={async () => {
            await aceptarInvitacion(aceptando.id)
            setAceptando(null)
            await recargar()
            await onCambio()
          }}
        >
          <p>
            Vas a pasar al grupo de <strong>{aceptando.integrantes.join(' y ')}</strong>
            {aceptando.tema ? <> (“{aceptando.tema}”)</> : null}.
          </p>
          <p>
            Tu tesis individual de esta clase todavía no tiene entregas, así que se borra: desde ahora
            trabajás en la del grupo. Las demás invitaciones de esta clase se descartan.
          </p>
        </ConfirmarAccion>
      )}
    </section>
  )
}
