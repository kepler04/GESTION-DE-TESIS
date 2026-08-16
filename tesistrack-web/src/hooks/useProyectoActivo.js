import { useEffect, useState } from 'react'
import { listarProyectos } from '../api/tesistrack'

const CLAVE = 'proyectoActivo'

/**
 * Carga los proyectos visibles y mantiene uno seleccionado.
 * El estudiante suele tener uno solo; el asesor y el coordinador varios,
 * así que la elección se recuerda entre pantallas.
 */
export default function useProyectoActivo() {
  const [proyectos, setProyectos] = useState([])
  const [activoId, setActivoId] = useState(() => {
    const guardado = localStorage.getItem(CLAVE)
    return guardado ? Number(guardado) : null
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false
    listarProyectos()
      .then((lista) => {
        if (cancelado) return
        setProyectos(lista)
        setActivoId((actual) => {
          const sigueExistiendo = lista.some((p) => p.id === actual)
          return sigueExistiendo ? actual : (lista[0]?.id ?? null)
        })
      })
      .catch((e) => !cancelado && setError(e.message))
      .finally(() => !cancelado && setCargando(false))
    return () => {
      cancelado = true
    }
  }, [])

  function seleccionar(id) {
    setActivoId(id)
    localStorage.setItem(CLAVE, String(id))
  }

  return {
    proyectos,
    activoId,
    activo: proyectos.find((p) => p.id === activoId) ?? null,
    seleccionar,
    cargando,
    error,
  }
}
