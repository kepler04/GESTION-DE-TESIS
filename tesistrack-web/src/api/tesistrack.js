import { api } from './client'

// --- proyectos ---
export const listarProyectos = () => api('/api/proyectos')
export const obtenerProyecto = (id) => api(`/api/proyectos/${id}`)
export const crearProyecto = (body) => api('/api/proyectos', { method: 'POST', body })
export const asignarAsesor = (id, asesorId) =>
  api(`/api/proyectos/${id}/asesor`, { method: 'PATCH', body: { asesorId } })
export const obtenerDashboard = (id) => api(`/api/proyectos/${id}/dashboard`)

// --- áreas (etiquetas privadas del asesor para agrupar sus tesis) ---
export const listarAreas = () => api('/api/areas')
export const crearArea = (nombre) => api('/api/areas', { method: 'POST', body: { nombre } })
export const renombrarArea = (id, nombre) =>
  api(`/api/areas/${id}`, { method: 'PUT', body: { nombre } })
export const eliminarArea = (id) => api(`/api/areas/${id}`, { method: 'DELETE' })
/** `areaId` en null le saca el área al proyecto. */
export const asignarArea = (proyectoId, areaId) =>
  api(`/api/proyectos/${proyectoId}/area`, { method: 'PATCH', body: { areaId } })
export const regenerarCodigo = (areaId) => api(`/api/areas/${areaId}/codigo`, { method: 'POST' })

// --- invitación por código (el estudiante se suma al espacio del asesor) ---
export const verInvitacion = (codigo) =>
  api(`/api/areas/invitacion/${encodeURIComponent(codigo)}`)
export const unirseConCodigo = (proyectoId, codigo) =>
  api(`/api/proyectos/${proyectoId}/unirse`, { method: 'PATCH', body: { codigo } })

// --- actividades del espacio (una consigna para todos los asesorados del área) ---
export const listarActividades = (areaId) => api(`/api/areas/${areaId}/actividades`)
export const crearActividad = (areaId, body) =>
  api(`/api/areas/${areaId}/actividades`, { method: 'POST', body })
export const eliminarActividad = (areaId, id) =>
  api(`/api/areas/${areaId}/actividades/${id}`, { method: 'DELETE' })
/** Grilla estudiantes × actividades. Solo la ve el dueño del espacio. */
export const verTablero = (areaId) => api(`/api/areas/${areaId}/tablero`)

// --- panel de asesorados ---
export const listarAsesorados = () => api('/api/asesorados')

// --- hitos ---
export const listarHitos = (proyectoId) => api(`/api/proyectos/${proyectoId}/hitos`)
export const crearHito = (proyectoId, body) =>
  api(`/api/proyectos/${proyectoId}/hitos`, { method: 'POST', body })
export const cambiarEstadoHito = (hitoId, estado) =>
  api(`/api/hitos/${hitoId}/estado`, { method: 'PATCH', body: { estado } })
export const eliminarHito = (hitoId) => api(`/api/hitos/${hitoId}`, { method: 'DELETE' })

// --- entregas y observaciones ---
export const listarEntregas = (hitoId) => api(`/api/hitos/${hitoId}/entregas`)
export const crearEntrega = (hitoId, body) =>
  api(`/api/hitos/${hitoId}/entregas`, { method: 'POST', body })
export const listarObservaciones = (entregaId) => api(`/api/entregas/${entregaId}/observaciones`)
export const crearObservacion = (entregaId, descripcion) =>
  api(`/api/entregas/${entregaId}/observaciones`, { method: 'POST', body: { descripcion } })
export const cambiarEstadoObservacion = (id, estado) =>
  api(`/api/observaciones/${id}/estado`, { method: 'PATCH', body: { estado } })

// --- asesorías y acuerdos ---
export const listarAsesorias = (proyectoId) => api(`/api/proyectos/${proyectoId}/asesorias`)
export const crearAsesoria = (proyectoId, body) =>
  api(`/api/proyectos/${proyectoId}/asesorias`, { method: 'POST', body })
export const listarAcuerdos = (asesoriaId) => api(`/api/asesorias/${asesoriaId}/acuerdos`)
export const crearAcuerdo = (asesoriaId, descripcion) =>
  api(`/api/asesorias/${asesoriaId}/acuerdos`, { method: 'POST', body: { descripcion } })

// --- tareas ---
export const listarTareas = (proyectoId, completada) =>
  api(
    `/api/proyectos/${proyectoId}/tareas${completada === undefined ? '' : `?completada=${completada}`}`,
  )
export const crearTarea = (proyectoId, body) =>
  api(`/api/proyectos/${proyectoId}/tareas`, { method: 'POST', body })
export const completarTarea = (id) => api(`/api/tareas/${id}/completar`, { method: 'PATCH' })

// --- usuarios ---
export const listarAsesores = () => api('/api/usuarios/asesores')
