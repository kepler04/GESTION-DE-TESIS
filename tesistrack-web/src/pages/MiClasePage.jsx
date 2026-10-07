import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { listarProyectos } from '../api/tesistrack'
import { Card, Cargando, ErrorMsg, PageHead, Vacio } from '../components/ui'

/**
 * Entrada del estudiante a su clase.
 *
 * Un estudiante suele tener una sola tesis y, con ella, una sola clase: en ese caso
 * entra directo. Si no tiene clase todavía le explica cómo conseguirla (el código de
 * su profesor); si tuviera varias, elige.
 */
export default function MiClasePage() {
  const [clases, setClases] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    listarProyectos()
      .then((proyectos) => {
        // Las distintas clases de sus tesis, sin repetir.
        const porId = new Map()
        proyectos.forEach((p) => p.area && porId.set(p.area.id, { ...p.area, asesor: p.asesor }))
        setClases([...porId.values()])
      })
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <ErrorMsg>{error}</ErrorMsg>
  if (clases === null) return <Cargando />
  if (clases.length === 1) return <Navigate to={`/clases/${clases[0].id}`} replace />

  return (
    <>
      <PageHead
        titulo="Mi clase"
        descripcion="Los avisos, las sesiones y los materiales que tu profesor deja para la clase."
      />
      {clases.length === 0 ? (
        <Card>
          <Vacio
            cta={
              <Link className="btn btn--primario" to="/panel">
                Unirme con un código
              </Link>
            }
          >
            Todavía no estás en ninguna clase. Cuando tu profesor te pase el código de su clase y
            lo uses, acá vas a ver sus avisos, sesiones y materiales.
          </Vacio>
        </Card>
      ) : (
        <Card titulo="Elegí una clase">
          <ul className="lista">
            {clases.map((e) => (
              <li key={e.id}>
                <div>
                  <strong>{e.nombre}</strong>
                  {e.asesor && <span className="lista__meta">de {e.asesor.name}</span>}
                </div>
                <Link className="btn btn--primario" to={`/clases/${e.id}`}>
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
