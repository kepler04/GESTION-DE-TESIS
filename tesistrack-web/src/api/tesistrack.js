import { api } from './client'

// --- proyectos ---
export const listarProyectos = () => api('/api/proyectos')
export const obtenerProyecto = (id) => api(`/api/proyectos/${id}`)
export const crearProyecto = (body) => api('/api/proyectos', { method: 'POST', body })
export const asignarAsesor = (id, asesorId) =>
  api(`/api/proyectos/${id}/asesor`, { method: 'PATCH', body: { asesorId } })
export const obtenerDashboard = (id) => api(`/api/proyectos/${id}/dashboard`)

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
