import { useState } from 'react'
import { crearArea, eliminarArea, regenerarCodigo, renombrarArea } from '../api/tesistrack'
import { Card, Vacio } from './ui'

/**
 * Alta, renombrado y borrado de las áreas del asesor.
 *
 * Las áreas son etiquetas **suyas** para agrupar sus tesis ("Ingeniería de
 * Software", "Consultorías privadas"). No son instituciones: no se comparten con
 * nadie ni otorgan permisos — eso es lo que descartó la Decisión 1.
 */
export default function GestorAreas({ areas, onCambio, onCerrar }) {
  const [nombre, setNombre] = useState('')
  const [editando, setEditando] = useState(null)
  const [nombreEditado, setNombreEditado] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [copiado, setCopiado] = useState(null)
  const [error, setError] = useState(null)

  async function correr(accion) {
    setError(null)
    setOcupado(true)
    try {
      await accion()
      await onCambio()
    } catch (e) {
      setError(e.message)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <Card
      titulo="Mis áreas"
      accion={
        <button type="button" className="btn btn--sutil" onClick={onCerrar}>
          Cerrar
        </button>
      }
    >
      <p className="areas__ayuda">
        Cada área es una carpeta tuya con un <strong>código de invitación</strong>. Pasáselo a tus
        asesorados: al crear su tesis lo pegan y quedan con vos, sin buscarte en ninguna lista.
      </p>

      {error && (
        <p className="alerta" role="alert">
          {error}
        </p>
      )}

      <form
        className="areas__alta"
        onSubmit={(e) => {
          e.preventDefault()
          correr(async () => {
            await crearArea(nombre)
            setNombre('')
          })
        }}
      >
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ingeniería de Software, UTEC – Posgrado, Privado…"
          maxLength={80}
          required
          aria-label="Nombre del área nueva"
        />
        <button type="submit" className="btn btn--primario" disabled={ocupado}>
          Agregar
        </button>
      </form>

      {areas.length === 0 ? (
        <Vacio>Todavía no creaste ninguna área.</Vacio>
      ) : (
        <ul className="areas__lista">
          {areas.map((a) => (
            <li key={a.id} className="areas__item">
              {editando === a.id ? (
                <form
                  className="areas__alta"
                  onSubmit={(e) => {
                    e.preventDefault()
                    correr(async () => {
                      await renombrarArea(a.id, nombreEditado)
                      setEditando(null)
                    })
                  }}
                >
                  <input
                    value={nombreEditado}
                    onChange={(e) => setNombreEditado(e.target.value)}
                    maxLength={80}
                    required
                    autoFocus
                    aria-label={`Nuevo nombre para ${a.nombre}`}
                  />
                  <button type="submit" className="btn btn--primario" disabled={ocupado}>
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="btn btn--sutil"
                    onClick={() => setEditando(null)}
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <>
                  <div className="areas__datos">
                    <span className="areas__nombre">{a.nombre}</span>
                    <span className="areas__codigo-linea">
                      <span className="tenue">Código para invitar:</span>
                      <code className="areas__codigo">{a.codigo}</code>
                      <button
                        type="button"
                        className="btn-copiar"
                        onClick={() => {
                          navigator.clipboard?.writeText(a.codigo)
                          setCopiado(a.id)
                          setTimeout(() => setCopiado(null), 1800)
                        }}
                      >
                        {copiado === a.id ? '✓ copiado' : 'copiar'}
                      </button>
                    </span>
                  </div>
                  <div className="areas__acciones">
                    <button
                      type="button"
                      className="btn btn--sutil"
                      onClick={() => {
                        setEditando(a.id)
                        setNombreEditado(a.nombre)
                      }}
                    >
                      Renombrar
                    </button>
                    <button
                      type="button"
                      className="btn btn--sutil"
                      disabled={ocupado}
                      onClick={() => {
                        // Regenerar invalida el código viejo: quien lo tenga deja
                        // de poder sumarse, pero los que ya entraron siguen igual.
                        if (
                          confirm(
                            `¿Generar un código nuevo para "${a.nombre}"?\n\nEl anterior deja de funcionar. Los estudiantes que ya entraron no se ven afectados.`,
                          )
                        ) {
                          correr(() => regenerarCodigo(a.id))
                        }
                      }}
                    >
                      Nuevo código
                    </button>
                    <button
                      type="button"
                      className="btn btn--sutil"
                      disabled={ocupado}
                      onClick={() => {
                        // Borrar solo despega la etiqueta: los proyectos quedan
                        // intactos, por eso no hace falta una confirmación grave.
                        if (confirm(`¿Borrar el área "${a.nombre}"? Los proyectos no se borran.`)) {
                          correr(() => eliminarArea(a.id))
                        }
                      }}
                    >
                      Borrar
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
