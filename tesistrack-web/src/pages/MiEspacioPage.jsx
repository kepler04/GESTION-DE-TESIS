import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { listarProyectos } from '../api/tesistrack'
import { Card, Cargando, ErrorMsg, PageHead, Vacio } from '../components/ui'

/**
 * Entrada del estudiante a su espacio.
 *
 * Un estudiante suele tener una sola tesis y, con ella, un solo espacio: en ese
 * caso entra directo. Si no tiene espacio todavía le explica cómo conseguirlo
 * (el código de su asesor); si tuviera varios, elige.
 */
export default function MiEspacioPage() {
  const [espacios, setEspacios] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    listarProyectos()
      .then((proyectos) => {
        // Distintos espacios de las tesis que tiene, sin repetir.
        const porId = new Map()
        proyectos.forEach((p) => p.area && porId.set(p.area.id, { ...p.area, asesor: p.asesor }))
        setEspacios([...porId.values()])
      })
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <ErrorMsg>{error}</ErrorMsg>
  if (espacios === null) return <Cargando />
  if (espacios.length === 1) return <Navigate to={`/espacios/${espacios[0].id}`} replace />

  return (
    <>
      <PageHead
        titulo="Mi espacio"
        descripcion="Las sesiones y los materiales que tu asesor deja para su grupo."
      />
      {espacios.length === 0 ? (
        <Card>
          <Vacio
            cta={
              <Link className="btn btn--primario" to="/panel">
                Unirme con un código
              </Link>
            }
          >
            Todavía no estás en ningún espacio. Cuando tu asesor te pase el código de su espacio y
            lo uses, acá vas a ver sus sesiones y sus materiales.
          </Vacio>
        </Card>
      ) : (
        <Card titulo="Elegí un espacio">
          <ul className="lista">
            {espacios.map((e) => (
              <li key={e.id}>
                <div>
                  <strong>{e.nombre}</strong>
                  {e.asesor && <span className="lista__meta">de {e.asesor.name}</span>}
                </div>
                <Link className="btn btn--primario" to={`/espacios/${e.id}`}>
                  Entrar
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}
