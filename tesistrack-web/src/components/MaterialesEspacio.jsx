import { useCallback, useEffect, useState } from 'react'
import {
  crearCarpeta,
  crearMaterialEnlace,
  descargarMaterial,
  editarMaterial,
  eliminarCarpeta,
  eliminarMaterial,
  listarCarpetas,
  renombrarCarpeta,
  rutaArchivoMaterial,
  subirMaterialArchivo,
} from '../api/tesistrack'
import ConfirmarAccion from './ConfirmarAccion'
import Icono from './Icono'
import VisorArchivo from './VisorArchivo'
import {
  Card,
  Cargando,
  ErrorMsg,
  Vacio,
} from './ui'
import { esPrevisualizable } from '../utils/archivos'
import { dominio, plural, tamano } from '../utils/formato'

/** Tiene que coincidir con el tope del backend (`EntregaService.TAMANO_MAXIMO`). */
const MAXIMO_BYTES = 15 * 1024 * 1024

/**
 * Carpetas de material de un espacio, como en un aula virtual: temas de tesis, la
 * rúbrica, las clases. Cada material es un **enlace** (Drive, una grabación, un
 * paper) o un **archivo** (PDF, Word, PowerPoint).
 *
 * El asesor dueño arma y edita todo; los estudiantes del espacio solo ven y
 * descargan. Para ellos las carpetas vacías no se muestran: una carpeta sin nada
 * adentro no les dice nada.
 */
export default function MaterialesEspacio({ areaId, editable, destacar }) {
  const [carpetas, setCarpetas] = useState(null)
  const [error, setError] = useState(null)
  const [nombreNueva, setNombreNueva] = useState('')
  const [creando, setCreando] = useState(false)

  const recargar = useCallback(
    () =>
      listarCarpetas(areaId)
        .then(setCarpetas)
        .catch((e) => setError(e.message)),
    [areaId],
  )

  useEffect(() => {
    recargar()
  }, [recargar])

  async function handleCrearCarpeta(e) {
    e.preventDefault()
    setError(null)
    setCreando(true)
    try {
      await crearCarpeta(areaId, nombreNueva)
      setNombreNueva('')
      await recargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setCreando(false)
    }
  }

  if (carpetas === null && !error) return <Cargando />

  const visibles = (carpetas ?? []).filter((c) => editable || c.materiales.length > 0)

  return (
    <Card titulo="Materiales">
      {error && <ErrorMsg>{error}</ErrorMsg>}

      {visibles.length === 0 ? (
        <Vacio icono="carpeta">
          {editable
            ? 'Todavía no tenés carpetas. Creá una y subí enlaces o archivos para tus alumnos.'
            : 'Tu profesor todavía no subió material.'}
        </Vacio>
      ) : (
        <div className="materiales carpetas-grid">
          {visibles.map((c) => (
            <Carpeta
              key={c.id}
              carpeta={c}
              editable={editable}
              destacada={destacar === c.id}
              onCambio={recargar}
              onError={setError}
            />
          ))}
        </div>
      )}

      {editable && (
        <form className="materiales__alta" onSubmit={handleCrearCarpeta}>
          <input
            value={nombreNueva}
            onChange={(e) => setNombreNueva(e.target.value)}
            placeholder="Nueva carpeta (Papers, Ejemplos de tesis…)"
            maxLength={80}
            aria-label="Nombre de la carpeta nueva"
            required
          />
          <button type="submit" className="btn btn--sutil" disabled={creando}>
            Agregar carpeta
          </button>
        </form>
      )}
    </Card>
  )
}

function Carpeta({ carpeta, editable, destacada, onCambio, onError }) {
  const [agregando, setAgregando] = useState(false)
  const [renombrando, setRenombrando] = useState(false)
  const [nombre, setNombre] = useState(carpeta.nombre)
  const [aBorrar, setABorrar] = useState(false)

  async function handleRenombrar(e) {
    e.preventDefault()
    onError(null)
    try {
      await renombrarCarpeta(carpeta.id, nombre)
      setRenombrando(false)
      await onCambio()
    } catch (err) {
      onError(err.message)
    }
  }

  const archivos = carpeta.materiales.filter((m) => m.esArchivo).length

  return (
    <section className={`carpeta-mat ${destacada ? 'carpeta-mat--destacada' : ''}`}>
      <header className="carpeta-mat__cabecera">
        {renombrando ? (
          <form className="areas__alta" onSubmit={handleRenombrar}>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={80}
              autoFocus
              required
              aria-label={`Nuevo nombre para ${carpeta.nombre}`}
            />
            <button type="submit" className="btn btn--primario">
              Guardar
            </button>
            <button type="button" className="btn btn--sutil" onClick={() => setRenombrando(false)}>
              Cancelar
            </button>
          </form>
        ) : (
          <>
            <h3 className="carpeta-mat__nombre">
              <Icono nombre="carpeta" />
              {carpeta.nombre}
              <span className="carpeta-mat__cuenta">
                {plural(carpeta.materiales.length, 'material', 'materiales')}
              </span>
            </h3>
            {editable && (
              <div className="acciones-fila">
                <button
                  type="button"
                  className="btn btn--sutil btn--chico"
                  onClick={() => setAgregando((v) => !v)}
                >
                  {agregando ? 'Cancelar' : 'Agregar material'}
                </button>
                <button
                  type="button"
                  className="btn btn--fantasma btn--chico"
                  onClick={() => {
                    setNombre(carpeta.nombre)
                    setRenombrando(true)
                  }}
                >
                  Renombrar
                </button>
                <button type="button" className="btn btn--fantasma btn--chico" onClick={() => setABorrar(true)}>
                  Borrar
                </button>
              </div>
            )}
          </>
        )}
      </header>

      {agregando && (
        <FormMaterial
          carpetaId={carpeta.id}
          onCerrar={() => setAgregando(false)}
          onListo={async () => {
            setAgregando(false)
            await onCambio()
          }}
        />
      )}

      {carpeta.materiales.length === 0 ? (
        <p className="tenue carpeta-mat__vacia">Vacía. Agregá un enlace o un archivo.</p>
      ) : (
        <ul className="lista materiales__lista">
          {carpeta.materiales.map((m) => (
            <Material key={m.id} material={m} editable={editable} onCambio={onCambio} onError={onError} />
          ))}
        </ul>
      )}

      {aBorrar && (
        <ConfirmarAccion
          titulo="Borrar esta carpeta"
          etiquetaConfirmar="Borrar carpeta"
          onCerrar={() => setABorrar(false)}
          onConfirmar={async () => {
            await eliminarCarpeta(carpeta.id)
            setABorrar(false)
            await onCambio()
          }}
        >
          <p>
            Vas a borrar <strong>{carpeta.nombre}</strong>
            {carpeta.materiales.length > 0 ? (
              <>
                {' '}
                con {plural(carpeta.materiales.length, 'material', 'materiales')}
                {archivos > 0 && <> ({plural(archivos, 'archivo subido', 'archivos subidos')})</>}.
              </>
            ) : (
              <>, que está vacía.</>
            )}
          </p>
          <p>
            Es <strong>irreversible</strong>: los archivos subidos no se pueden recuperar. Los
            estudiantes dejan de verlos.
          </p>
        </ConfirmarAccion>
      )}
    </section>
  )
}

function Material({ material, editable, onCambio, onError }) {
  const [editando, setEditando] = useState(false)
  const [titulo, setTitulo] = useState(material.titulo)
  const [url, setUrl] = useState(material.url ?? '')
  const [aQuitar, setAQuitar] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [viendo, setViendo] = useState(false)

  async function handleGuardar(e) {
    e.preventDefault()
    onError(null)
    try {
      await editarMaterial(material.id, { titulo, url: material.esArchivo ? null : url })
      setEditando(false)
      await onCambio()
    } catch (err) {
      onError(err.message)
    }
  }

  async function handleDescargar() {
    onError(null)
    setDescargando(true)
    try {
      await descargarMaterial(material)
    } catch (err) {
      onError(err.message)
    } finally {
      setDescargando(false)
    }
  }

  const meta = material.esArchivo
    ? `${extension(material.archivoNombre)} · ${tamano(material.archivoTamano)}`
    : dominio(material.url)

  if (editando) {
    return (
      <li>
        <form className="areas__alta materiales__edicion" onSubmit={handleGuardar}>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={160}
            aria-label="Título del material"
            autoFocus
            required
          />
          {!material.esArchivo && (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              pattern="https://.+"
              title="El enlace tiene que empezar con https://"
              aria-label="Enlace del material"
              required
            />
          )}
          <button type="submit" className="btn btn--primario">
            Guardar
          </button>
          <button type="button" className="btn btn--sutil" onClick={() => setEditando(false)}>
            Cancelar
          </button>
        </form>
      </li>
    )
  }

  return (
    <li>
      <div className="material">
        <span className={`tag ${material.esArchivo ? 'tag--archivo' : 'tag--enlace'}`}>
          {material.esArchivo ? 'Archivo' : 'Enlace'}
        </span>
        <div>
          <strong>{material.titulo}</strong>
          <span className="lista__meta">{meta}</span>
        </div>
      </div>
      <div className="acciones-fila">
        {material.esArchivo ? (
          <>
            {/* Solo se previsualiza lo que el backend verificó por sus bytes (imágenes y
                PDF). Word, PowerPoint y el resto solo se descargan, y se dice por qué. */}
            {esPrevisualizable(material.archivoTipo) ? (
              <button type="button" className="btn btn--sutil btn--chico" onClick={() => setViendo(true)}>
                <Icono nombre="ojo" />
                Ver
              </button>
            ) : (
              <span className="tenue sin-vista">Sin vista previa: descargalo para abrirlo.</span>
            )}
            <button
              type="button"
              className="btn btn--sutil btn--chico"
              onClick={handleDescargar}
              disabled={descargando}
            >
              <Icono nombre="descargar" />
              {descargando ? 'Descargando…' : 'Descargar'}
            </button>
          </>
        ) : (
          <a className="btn btn--sutil btn--chico" href={material.url} target="_blank" rel="noopener noreferrer">
            <Icono nombre="externo" />
            Abrir enlace
          </a>
        )}
        {editable && (
          <>
            <button type="button" className="btn btn--fantasma btn--chico" onClick={() => setEditando(true)}>
              Editar
            </button>
            <button type="button" className="btn btn--fantasma btn--chico" onClick={() => setAQuitar(true)}>
              Quitar
            </button>
          </>
        )}
      </div>

      {viendo && (
        <VisorArchivo
          titulo={material.titulo}
          nombreArchivo={material.archivoNombre}
          tipo={material.archivoTipo}
          tamano={material.archivoTamano}
          ruta={rutaArchivoMaterial(material.id)}
          onCerrar={() => setViendo(false)}
        />
      )}

      {aQuitar && (
        <ConfirmarAccion
          titulo="Quitar este material"
          etiquetaConfirmar="Quitar material"
          onCerrar={() => setAQuitar(false)}
          onConfirmar={async () => {
            await eliminarMaterial(material.id)
            setAQuitar(false)
            await onCambio()
          }}
        >
          <p>
            Vas a quitar <strong>{material.titulo}</strong>
            {material.esArchivo && <> y el archivo subido, que no se puede recuperar</>}. Los
            estudiantes dejan de verlo.
          </p>
        </ConfirmarAccion>
      )}
    </li>
  )
}

/**
 * Alta de un material. Un enlace o un archivo: nunca los dos, igual que el CHECK de
 * la base. El archivo se sube junto con su título en un solo paso.
 */
function FormMaterial({ carpetaId, onCerrar, onListo }) {
  const [tipo, setTipo] = useState('enlace')
  const [titulo, setTitulo] = useState('')
  const [url, setUrl] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (tipo === 'archivo') {
      if (!archivo) return setError('Elegí un archivo.')
      if (archivo.size > MAXIMO_BYTES) return setError('El archivo supera los 15 MB.')
    }
    setGuardando(true)
    try {
      if (tipo === 'enlace') await crearMaterialEnlace(carpetaId, { titulo, url })
      else await subirMaterialArchivo(carpetaId, archivo, titulo)
      await onListo()
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <form className="form materiales__form" onSubmit={handleSubmit}>
      <fieldset className="materiales__tipo">
        <legend>Qué vas a agregar</legend>
        <label>
          <input
            type="radio"
            name={`tipo-${carpetaId}`}
            checked={tipo === 'enlace'}
            onChange={() => setTipo('enlace')}
          />
          Un enlace
        </label>
        <label>
          <input
            type="radio"
            name={`tipo-${carpetaId}`}
            checked={tipo === 'archivo'}
            onChange={() => setTipo('archivo')}
          />
          Un archivo
        </label>
      </fieldset>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <label>
        Título {tipo === 'archivo' && <span className="tenue">(opcional: si no, el nombre del archivo)</span>}
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={160}
          placeholder={tipo === 'enlace' ? 'Banco de temas 2026' : 'Rúbrica de evaluación'}
          required={tipo === 'enlace'}
          autoFocus
        />
      </label>

      {tipo === 'enlace' ? (
        <label>
          Enlace
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://drive.google.com/…"
            pattern="https://.+"
            title="El enlace tiene que empezar con https://"
            required
          />
        </label>
      ) : (
        <label>
          Archivo <span className="tenue">(PDF, Word, PowerPoint… hasta 15 MB)</span>
          <input type="file" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} required />
        </label>
      )}

      <div className="form__acciones">
        <button type="submit" className="btn btn--primario" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Agregar'}
        </button>
        <button type="button" className="btn btn--sutil" onClick={onCerrar} disabled={guardando}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

/** La extensión en mayúsculas ("PDF", "DOCX"), o "Archivo" si no tiene. */
function extension(nombre) {
  const punto = nombre?.lastIndexOf('.') ?? -1
  return punto > 0 ? nombre.slice(punto + 1).toUpperCase() : 'Archivo'
}
