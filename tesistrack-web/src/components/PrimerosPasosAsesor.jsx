import { useState } from 'react'
import { Link } from 'react-router-dom'
import { crearArea } from '../api/tesistrack'
import { Card } from './ui'

/**
 * La primera pantalla de un asesor que todavía no tiene a nadie.
 *
 * Antes caía en "Todavía no tenés proyectos asignados. Pasales a tus asesorados el
 * código de tu carpeta" —un código que no existía— y sin un solo botón. Seis de las
 * ocho pantallas le decían lo mismo.
 *
 * El asesor tiene **un solo** primer paso, a diferencia del estudiante que podía
 * llegar con código o sin él. Así que esto no pregunta: lleva.
 *
 *   sin espacio  → crearlo, y el código aparece en grande apenas se crea
 *   con espacio  → el código y el mensaje listo para mandar, porque el cuello de
 *                  botella de todo el sistema es que ese código llegue a alguien
 */
export default function PrimerosPasosAsesor({ areas, onCreada }) {
  const [nombre, setNombre] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [copiado, setCopiado] = useState(null)
  // El espacio recién creado se destaca; si ya había, se muestran todos.
  const [nuevo, setNuevo] = useState(null)

  async function handleCrear(e) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      const area = await crearArea(nombre.trim())
      setNuevo(area)
      setNombre('')
      await onCreada()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  function copiar(texto, clave) {
    navigator.clipboard?.writeText(texto)
    setCopiado(clave)
    setTimeout(() => setCopiado(null), 2000)
  }

  const mostrar = nuevo ?? areas[0]

  // --- todavía no tiene espacio ---
  if (!mostrar) {
    return (
      <Card className="card--bienvenida">
        <div className="primeros">
          <p className="primeros__hola">¿Es tu primera vez acá?</p>
          <h2 className="primeros__titulo">Creá tu espacio de trabajo</h2>
          <p className="primeros__texto">
            Es tu carpeta: le ponés el nombre que quieras y te da un código para invitar a tus
            asesorados. Cuando lo usen, sus tesis aparecen acá y podés seguirlas todas juntas.
          </p>

          {error && (
            <p className="alerta" role="alert">
              {error}
            </p>
          )}

          <form className="form primeros__form" onSubmit={handleCrear}>
            <label>
              Nombre del espacio
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Taller de Tesis I"
                maxLength={80}
                autoFocus
                required
              />
            </label>
            <p className="tenue">
              Podés usar el nombre de tu curso, tu universidad o tu consultoría. Después lo podés
              cambiar, y podés tener más de uno.
            </p>
            <div className="form__acciones">
              <button
                type="submit"
                className="btn btn--primario"
                disabled={guardando || !nombre.trim()}
              >
                {guardando ? 'Creando…' : 'Crear espacio'}
              </button>
            </div>
          </form>
        </div>
      </Card>
    )
  }

  // --- ya tiene espacio pero nadie se sumó ---
  const invitacion =
    `Te invito a mi espacio en TesisTrack. ` +
    `Entrá a ${window.location.origin} , creá tu cuenta como estudiante ` +
    `y usá el código ${mostrar.codigo} para sumar tu tesis.`

  return (
    <Card className="card--bienvenida">
      <div className="primeros">
        {nuevo ? (
          <>
            <p className="primeros__hola">✓ Espacio creado</p>
            <h2 className="primeros__titulo">{nuevo.nombre}</h2>
          </>
        ) : (
          <>
            <p className="primeros__hola">Falta lo más importante</p>
            <h2 className="primeros__titulo">Invitá a tus asesorados</h2>
          </>
        )}
        <p className="primeros__texto">
          Este es el código de <strong>{mostrar.nombre}</strong>. Pasáselo a tus estudiantes: lo
          pegan al crear su tesis y quedan bajo tu seguimiento.
        </p>

        <div className="primeros__codigo">
          <code className="carpeta__codigo carpeta__codigo--grande">{mostrar.codigo}</code>
          <button
            type="button"
            className="btn btn--sutil"
            onClick={() => copiar(mostrar.codigo, 'codigo')}
          >
            {copiado === 'codigo' ? '✓ Copiado' : 'Copiar código'}
          </button>
        </div>

        <div className="primeros__opciones">
          <button
            type="button"
            className="btn btn--primario"
            onClick={() => copiar(invitacion, 'mensaje')}
          >
            {copiado === 'mensaje' ? '✓ Mensaje copiado' : 'Copiar invitación para enviar'}
          </button>
          <Link className="btn btn--sutil" to={`/espacios/${mostrar.id}`}>
            Dejar la primera actividad
          </Link>
        </div>

        <p className="tenue primeros__pie">
          Mientras se suman, podés dejar las actividades listas: al entrar las reciben
          automáticamente.
        </p>
      </div>
    </Card>
  )
}
