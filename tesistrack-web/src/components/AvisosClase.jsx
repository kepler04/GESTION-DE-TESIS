import { useCallback, useEffect, useState } from 'react'
import { crearAviso, eliminarAviso, listarAvisos } from '../api/tesistrack'
import ConfirmarAccion from './ConfirmarAccion'
import { Cargando, ErrorMsg, Vacio, fechaHora } from './ui'
import { iniciales } from '../utils/formato'

/**
 * Los avisos del Tablón: lo que el profesor le quiere decir a toda la clase.
 *
 * Texto simple, el más nuevo primero. Sin comentarios, sin adjuntos y sin avisos por
 * correo: es un tablón, no un chat. Los publica y los quita el profesor; los leen
 * todos los miembros de la clase. Por eso el autor de cada aviso es siempre el
 * profesor de la clase (`profesor`).
 */
export default function AvisosClase({ areaId, editable, profesor }) {
  const [avisos, setAvisos] = useState(null)
  const [error, setError] = useState(null)
  const [texto, setTexto] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [aQuitar, setAQuitar] = useState(null)

  const recargar = useCallback(
    () =>
      listarAvisos(areaId)
        .then(setAvisos)
        .catch((e) => setError(e.message)),
    [areaId],
  )

  useEffect(() => {
    recargar()
  }, [recargar])

  async function handlePublicar(e) {
    e.preventDefault()
    setError(null)
    setPublicando(true)
    try {
      await crearAviso(areaId, texto)
      setTexto('')
      await recargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setPublicando(false)
    }
  }

  if (avisos === null && !error) return <Cargando />

  const lista = avisos ?? []

  return (
    <section className="avisos-clase" aria-label="Avisos">
      <h2 className="sr-only">Avisos</h2>
      {error && <ErrorMsg>{error}</ErrorMsg>}

      {editable && (
        <div className="aviso aviso-nuevo">
          <span className="avatar" aria-hidden="true">
            {iniciales(profesor)}
          </span>
          <form className="aviso__form" onSubmit={handlePublicar}>
            <label className="sr-only" htmlFor={`aviso-nuevo-${areaId}`}>
              Publicar un aviso para toda la clase
            </label>
            <textarea
              id={`aviso-nuevo-${areaId}`}
              rows={2}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={2000}
              placeholder="Compartí un aviso o una indicación con toda la clase…"
              required
            />
            {texto.trim() && (
              <div className="form__acciones">
                <button type="submit" className="btn btn--primario btn--chico" disabled={publicando}>
                  {publicando ? 'Publicando…' : 'Publicar aviso'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {lista.length === 0 ? (
        <Vacio icono="tablon">
          {editable
            ? 'Todavía no publicaste ningún aviso. Lo que escribas acá lo ve toda la clase.'
            : 'Tu profesor todavía no publicó avisos.'}
        </Vacio>
      ) : (
        <ul className="avisos">
          {lista.map((a) => (
            <li key={a.id} className="aviso">
              <div className="aviso__autor">
                <span className="avatar" aria-hidden="true">
                  {iniciales(profesor)}
                </span>
                <div>
                  <strong>{profesor}</strong>
                  <span>{fechaHora(a.createdAt)}</span>
                </div>
                {editable && (
                  <button type="button" className="btn btn--fantasma btn--chico" onClick={() => setAQuitar(a)}>
                    Quitar
                  </button>
                )}
              </div>
              <p className="aviso__texto">{a.texto}</p>
            </li>
          ))}
        </ul>
      )}

      {aQuitar && (
        <ConfirmarAccion
          titulo="Quitar este aviso"
          etiquetaConfirmar="Quitar aviso"
          onCerrar={() => setAQuitar(null)}
          onConfirmar={async () => {
            await eliminarAviso(aQuitar.id)
            setAQuitar(null)
            await recargar()
          }}
        >
          <p>El aviso deja de verse para toda la clase. No se puede recuperar.</p>
        </ConfirmarAccion>
      )}
    </section>
  )
}
