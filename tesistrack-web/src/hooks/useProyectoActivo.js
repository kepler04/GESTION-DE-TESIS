import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listarProyectos } from '../api/tesistrack'

const CLAVE = 'proyectoActivo'

/**
 * Carga los proyectos visibles y mantiene uno seleccionado.
 * El estudiante suele tener uno solo; el asesor y el coordinador varios,
 * así que la elección se recuerda entre pantallas.
 */
export default function useProyectoActivo() {
  // Un enlace directo puede traer la tesis (`?proyecto=`), por ejemplo desde el
  // Dashboard del profesor; manda sobre la última elección guardada.
  const [params] = useSearchParams()
  const pedido = Number(params.get('proyecto')) || null
  const [proyectos, setProyectos] = useState([])
  const [activoId, setActivoId] = useState(() => {
    if (pedido) return pedido
    const guardado = localStorage.getItem(CLAVE)
    return guardado ? Number(guardado) : null
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Expuesto para quien crea un proyecto desde una pantalla que usa este hook
  // (los primeros pasos del estudiante): sin esto habría que recargar a mano.
  const recargar = useCallback(
    () =>
      listarProyectos()
        .then((lista) => {
          setProyectos(lista)
          setActivoId((actual) => {
            const sigueExistiendo = lista.some((p) => p.id === actual)
            return sigueExistiendo ? actual : (lista[0]?.id ?? null)
          })
        })
        .catch((e) => setError(e.message))
        .finally(() => setCargando(false)),
    [],
  )

  useEffect(() => {
    recargar()
  }, [recargar])

  function seleccionar(id) {
    setActivoId(id)
    localStorage.setItem(CLAVE, String(id))
  }

  return {
    proyectos,
    activoId,
    activo: proyectos.find((p) => p.id === activoId) ?? null,
    seleccionar,
    recargar,
    cargando,
    error,
  }
}
