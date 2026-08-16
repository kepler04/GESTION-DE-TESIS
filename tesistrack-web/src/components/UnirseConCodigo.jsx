import { useState } from 'react'
import { unirseConCodigo, verInvitacion } from '../api/tesistrack'
import { Card } from './ui'

/**
 * El estudiante pega el código que le pasó su asesor y se suma a su espacio.
 *
 * Va en dos tiempos a propósito: primero se consulta a quién pertenece el código
 * y se muestra el nombre del asesor, y recién después se confirma. Un código mal
 * tipeado que caiga en el de otro asesor se detecta acá, y no dos semanas después.
 */
export default function UnirseConCodigo({ proyectoId, onUnido, onCerrar }) {
  const [codigo, setCodigo] = useState('')
  const [invitacion, setInvitacion] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  async function handleBuscar(e) {
    e.preventDefault()
    setError(null)
    setOcupado(true)
    try {
      setInvitacion(await verInvitacion(codigo.trim()))
    } catch (err) {
      setError(err.message)
      setInvitacion(null)
    } finally {
      setOcupado(false)
    }
  }

  async function handleConfirmar() {
    setError(null)
    setOcupado(true)
    try {
      await unirseConCodigo(proyectoId, codigo.trim())
      await onUnido()
    } catch (err) {
      setError(err.message)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <Card
      titulo="Unirme con un código"
      accion={
        <button type="button" className="btn btn--sutil" onClick={onCerrar}>
          Cerrar
        </button>
      }
    >
      {error && (
        <p className="alerta" role="alert">
          {error}
        </p>
      )}

      {invitacion ? (
        <div className="invitacion">
          <p className="invitacion__intro">Vas a sumar tu tesis a:</p>
          <p className="invitacion__area">{invitacion.area}</p>
          <p className="invitacion__asesor">
            Asesor: <strong>{invitacion.asesor}</strong>
            <span className="lista__meta">{invitacion.asesorEmail}</span>
          </p>
          <div className="form__acciones">
            <button
              type="button"
              className="btn btn--primario"
              onClick={handleConfirmar}
              disabled={ocupado}
            >
              {ocupado ? 'Uniéndome…' : 'Confirmar'}
            </button>
            <button
              type="button"
              className="btn btn--sutil"
              onClick={() => setInvitacion(null)}
              disabled={ocupado}
            >
              Usar otro código
            </button>
          </div>
        </div>
      ) : (
        <form className="form" onSubmit={handleBuscar}>
          <label>
            Código que te pasó tu asesor
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="TT-XXXXXX"
              // Se acepta en minúsculas: el backend lo normaliza.
              autoCapitalize="characters"
              required
            />
          </label>
          <div className="form__acciones">
            <button type="submit" className="btn btn--primario" disabled={ocupado}>
              {ocupado ? 'Buscando…' : 'Buscar'}
            </button>
          </div>
        </form>
      )}
    </Card>
  )
}
