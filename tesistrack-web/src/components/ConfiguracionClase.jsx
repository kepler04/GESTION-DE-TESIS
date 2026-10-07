import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eliminarArea, regenerarCodigo, renombrarArea } from '../api/tesistrack'
import BorrarEspacio from './BorrarEspacio'
import ConfirmarAccion from './ConfirmarAccion'
import { Card, ChipCodigo, ErrorMsg } from './ui'

/**
 * Configuración de la clase (solo el profesor): cambiarle el nombre, cambiar el
 * código de invitación y, al final, la zona de peligro con "Borrar clase".
 *
 * Borrar vive **dentro de la propia clase**, no en otra pantalla: es donde el
 * profesor está parado cuando decide irse. Reutiliza el diálogo de la Decisión 18
 * (hay que escribir el nombre, y se listan lo que se pierde y lo que no).
 */
export default function ConfiguracionClase({ area, onCambio }) {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState(area.nombre)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [guardado, setGuardado] = useState(false)
  const [regenerar, setRegenerar] = useState(false)
  const [borrando, setBorrando] = useState(false)

  async function handleRenombrar(e) {
    e.preventDefault()
    setError(null)
    setGuardado(false)
    setGuardando(true)
    try {
      await renombrarArea(area.id, nombre)
      setGuardado(true)
      await onCambio()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      {error && <ErrorMsg>{error}</ErrorMsg>}

      <Card titulo="Nombre de la clase">
        <form className="form" onSubmit={handleRenombrar}>
          <label>
            Nombre
            <input
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value)
                setGuardado(false)
              }}
              maxLength={80}
              required
            />
          </label>
          <div className="form__acciones">
            <button
              type="submit"
              className="btn btn--primario"
              disabled={guardando || !nombre.trim() || nombre.trim() === area.nombre}
            >
              {guardando ? 'Guardando…' : 'Guardar nombre'}
            </button>
            {guardado && <span className="tenue">✓ Guardado</span>}
          </div>
        </form>
      </Card>

      <Card titulo="Código de invitación">
        <p className="areas__ayuda">
          Se lo pasás a tus alumnos: al crear su tesis lo pegan y entran a esta clase. Si se
          filtró, generá uno nuevo: el anterior deja de funcionar y quienes ya entraron no se
          ven afectados.
        </p>
        <div className="carpeta__codigo-caja">
          <ChipCodigo codigo={area.codigo} grande />
          <button type="button" className="btn btn--sutil" onClick={() => setRegenerar(true)}>
            Generar código nuevo
          </button>
        </div>
      </Card>

      <section className="zona-peligro" aria-labelledby="zona-peligro-titulo">
        <h2 id="zona-peligro-titulo" className="zona-peligro__titulo">
          Zona de peligro
        </h2>
        <div className="zona-peligro__fila">
          <div>
            <strong>Borrar esta clase</strong>
            <p className="lista__meta">
              Se van sus actividades, materiales, sesiones y avisos. Las tesis de los grupos y sus
              hitos se quedan. No se puede deshacer.
            </p>
          </div>
          <button type="button" className="btn btn--peligro" onClick={() => setBorrando(true)}>
            Borrar clase
          </button>
        </div>
      </section>

      {regenerar && (
        <ConfirmarAccion
          titulo="Generar un código nuevo"
          etiquetaConfirmar="Generar código nuevo"
          peligro={false}
          onCerrar={() => setRegenerar(false)}
          onConfirmar={async () => {
            await regenerarCodigo(area.id)
            setRegenerar(false)
            await onCambio()
          }}
        >
          <p>
            El código <strong>{area.codigo}</strong> deja de funcionar. Los alumnos que ya entraron
            no se ven afectados; a quienes todavía no se sumaron les tenés que pasar el nuevo.
          </p>
        </ConfirmarAccion>
      )}

      {borrando && (
        <BorrarEspacio
          area={area}
          onCerrar={() => setBorrando(false)}
          onBorrado={async () => {
            await eliminarArea(area.id)
            setBorrando(false)
            navigate('/clases', { replace: true })
          }}
        />
      )}
    </>
  )
}
