import { useCallback, useEffect, useState } from 'react'
import { crearAviso, eliminarAviso, listarAvisos } from '../api/tesistrack'
import ConfirmarAccion from './ConfirmarAccion'
import { Card, Cargando, ErrorMsg, Vacio, fechaHora } from './ui'

/**
 * Los avisos del Tablón: lo que el profesor le quiere decir a toda la clase.
 *
 * Texto simple, el más nuevo primero. Sin comentarios, sin adjuntos y sin avisos por
 * correo: es un tablón, no un chat. Los publica y los quita el profesor; los leen
 * todos los miembros de la clase.
 */
export default function AvisosClase({ areaId, editable }) {
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
    <Card titulo="Avisos">
      {error && <ErrorMsg>{error}</ErrorMsg>}

      {editable && (
        <form className="form aviso__form" onSubmit={handlePublicar}>
          <label>
            Publicar un aviso para toda la clase
            <textarea
              rows={3}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={2000}
              placeholder="Mañana la clase empieza a las 7. Traigan la matriz impresa."
              required
            />
          </label>
          <div className="form__acciones">
            <button type="submit" className="btn btn--primario" disabled={publicando || !texto.trim()}>
              {publicando ? 'Publicando…' : 'Publicar aviso'}
            </button>
          </div>
        </form>
      )}

      {lista.length === 0 ? (
        <Vacio>
          {editable
            ? 'Todavía no publicaste ningún aviso.'
            : 'Tu profesor todavía no publicó avisos.'}
        </Vacio>
      ) : (
        <ul className="avisos">
          {lista.map((a) => (
            <li key={a.id} className="aviso">
              <p className="aviso__texto">{a.texto}</p>
              <div className="aviso__pie">
                <span className="lista__meta">{fechaHora(a.createdAt)}</span>
                {editable && (
                  <button type="button" className="btn btn--sutil" onClick={() => setAQuitar(a)}>
                    Quitar
                  </button>
                )}
              </div>
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
    </Card>
  )
}
