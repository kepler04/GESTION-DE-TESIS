import { useState } from 'react'
import { crearProyecto, verInvitacion } from '../api/tesistrack'
import { Card } from './ui'

/**
 * La primera pantalla de un estudiante que todavía no tiene tesis.
 *
 * Antes acá había un "Todavía no tenés un proyecto" con un botón que llevaba a
 * un formulario donde el código de invitación era un campo más, perdido entre
 * el título y el selector de asesor. Quien llegaba con un código en la mano no
 * tenía forma de saber que ese era su camino.
 *
 * Ahora la pantalla pregunta primero **cómo llegaste**, porque de eso dependen
 * dos recorridos distintos:
 *
 *   con código  → se previsualiza la carpeta y el asesor, y recién ahí se pide
 *                 el título; el proyecto nace ya con asesor asignado
 *   sin código  → solo el título; el proyecto nace huérfano y el Dashboard
 *                 después le ofrece unirse
 *
 * El código va en el `POST /proyectos` y no en `PATCH /unirse` a propósito:
 * unirse necesita un proyecto que todavía no existe.
 */
export default function PrimerosPasos({ onListo }) {
  const [paso, setPaso] = useState('elegir')
  const [codigo, setCodigo] = useState('')
  const [invitacion, setInvitacion] = useState(null)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  async function handleBuscar(e) {
    e.preventDefault()
    setError(null)
    setOcupado(true)
    try {
      setInvitacion(await verInvitacion(codigo.trim()))
      setPaso('confirmar')
    } catch (err) {
      setError(err.message)
    } finally {
      setOcupado(false)
    }
  }

  async function handleCrear(e) {
    e.preventDefault()
    setError(null)
    setOcupado(true)
    try {
      await crearProyecto({
        titulo,
        descripcion: descripcion || null,
        // Solo viaja si el estudiante vino por el camino del código.
        codigoInvitacion: invitacion ? codigo.trim() : null,
      })
      await onListo()
    } catch (err) {
      setError(err.message)
      setOcupado(false)
    }
  }

  function volver() {
    setError(null)
    setInvitacion(null)
    setPaso('elegir')
  }

  const alerta = error && (
    <p className="alerta" role="alert">
      {error}
    </p>
  )

  if (paso === 'elegir') {
    return (
      <Card className="card--bienvenida">
        <div className="primeros">
          <p className="primeros__hola">¿Es tu primera vez acá?</p>
          <h2 className="primeros__titulo">Empecemos por tu tesis</h2>
          <p className="primeros__texto">
            Si tu asesor o tu coordinación te pasó un código, con eso te sumás a su carpeta y ya
            quedan conectados. Si todavía no tenés uno, podés crear tu tesis igual y sumarte
            después.
          </p>
          <div className="primeros__opciones">
            <button
              type="button"
              className="btn btn--primario"
              onClick={() => setPaso('codigo')}
            >
              Tengo un código
            </button>
            <button
              type="button"
              className="btn btn--sutil"
              onClick={() => setPaso('sin-codigo')}
            >
              Todavía no tengo código
            </button>
          </div>
        </div>
      </Card>
    )
  }

  if (paso === 'codigo') {
    return (
      <Card titulo="Unirme a la carpeta de mi asesor">
        {alerta}
        <form className="form" onSubmit={handleBuscar}>
          <label>
            Código que te pasaron
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="TT-XXXXXX"
              // Se acepta en minúsculas: el backend lo normaliza.
              autoCapitalize="characters"
              autoFocus
              required
            />
          </label>
          <p className="tenue">
            Antes de crear nada te vamos a mostrar de quién es la carpeta, para que confirmes que
            es la correcta.
          </p>
          <div className="form__acciones">
            <button type="submit" className="btn btn--primario" disabled={ocupado}>
              {ocupado ? 'Buscando…' : 'Buscar'}
            </button>
            <button type="button" className="btn btn--sutil" onClick={volver} disabled={ocupado}>
              Volver
            </button>
          </div>
        </form>
      </Card>
    )
  }

  const conCodigo = paso === 'confirmar'

  return (
    <Card titulo={conCodigo ? 'Confirmá y creá tu tesis' : 'Creá tu tesis'}>
      {alerta}

      {conCodigo && (
        <div className="invitacion">
          <p className="invitacion__intro">Tu tesis va a sumarse a:</p>
          <p className="invitacion__area">{invitacion.area}</p>
          <p className="invitacion__asesor">
            Asesor: <strong>{invitacion.asesor}</strong>
            <span className="lista__meta">{invitacion.asesorEmail}</span>
          </p>
        </div>
      )}

      <form className="form" onSubmit={handleCrear}>
        <label>
          Título de tu tesis
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Todavía puede ser provisorio"
            autoFocus
            required
          />
        </label>
        <label>
          Descripción <span className="tenue">(opcional)</span>
          <textarea rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </label>
        {!conCodigo && (
          <p className="tenue">
            Vas a quedar sin asesor por ahora. Cuando te pasen un código, el panel te va a ofrecer
            unirte.
          </p>
        )}
        <div className="form__acciones">
          <button type="submit" className="btn btn--primario" disabled={ocupado}>
            {ocupado ? 'Creando…' : 'Crear mi tesis'}
          </button>
          <button
            type="button"
            className="btn btn--sutil"
            onClick={conCodigo ? () => setPaso('codigo') : volver}
            disabled={ocupado}
          >
            Volver
          </button>
        </div>
      </form>
    </Card>
  )
}
