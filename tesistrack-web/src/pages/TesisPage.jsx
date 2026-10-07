import { useEffect, useState } from 'react'
import { listarProyectos } from '../api/tesistrack'
import { useAuth } from '../auth/AuthContext'
import TablaTesis from '../components/TablaTesis'
import { Card, Cargando, ErrorMsg, PageHead, Vacio } from '../components/ui'

/**
 * Todas las tesis de la plataforma, para el coordinador. Es de solo lectura
 * (Decisión 8): consulta y supervisa, pero no crea ni modifica nada, así que la
 * tabla no lleva acciones.
 */
export default function TesisPage() {
  const { user } = useAuth()
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    listarProyectos()
      .then(setProyectos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [])

  return (
    <>
      <PageHead titulo="Tesis" descripcion="Todas las tesis de la plataforma, solo para consultar." />
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {cargando ? (
        <Cargando />
      ) : proyectos.length === 0 ? (
        <Card>
          <Vacio>Todavía no hay tesis para consultar.</Vacio>
        </Card>
      ) : (
        <Card titulo={`${proyectos.length} ${proyectos.length === 1 ? 'tesis' : 'tesis'}`}>
          <TablaTesis proyectos={proyectos} rol={user?.role} />
        </Card>
      )}
    </>
  )
}
