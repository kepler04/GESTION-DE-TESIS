import { api, apiDescargarArchivo, apiSubirArchivo } from './client'

export { apiBlob, apiDescargarArchivo } from './client'

// --- proyectos ---
export const listarProyectos = () => api('/api/proyectos')
export const obtenerProyecto = (id) => api(`/api/proyectos/${id}`)
export const crearProyecto = (body) => api('/api/proyectos', { method: 'POST', body })
export const asignarAsesor = (id, asesorId) =>
  api(`/api/proyectos/${id}/asesor`, { method: 'PATCH', body: { asesorId } })
export const obtenerDashboard = (id) => api(`/api/proyectos/${id}/dashboard`)

/** Saca el proyecto de la lista del asesor sin borrar nada. */
export const desvincularAsesor = (proyectoId) =>
  api(`/api/proyectos/${proyectoId}/asesor`, { method: 'DELETE' })
/** Irreversible: se lleva hitos, entregas, observaciones, asesorías y tareas. */
export const eliminarProyecto = (proyectoId) =>
  api(`/api/proyectos/${proyectoId}`, { method: 'DELETE' })

// --- integrantes de una tesis grupal ---
export const agregarEstudiante = (proyectoId, email) =>
  api(`/api/proyectos/${proyectoId}/estudiantes`, { method: 'POST', body: { email } })
export const quitarEstudiante = (proyectoId, estudianteId) =>
  api(`/api/proyectos/${proyectoId}/estudiantes/${estudianteId}`, { method: 'DELETE' })

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

/** La página de un espacio para cualquiera de sus miembros (el código solo lo ve el dueño). */
export const verEspacio = (areaId) => api(`/api/areas/${areaId}/espacio`)
/** Qué se lleva y qué deja borrar el espacio, en números. Solo el dueño. */
export const resumenEspacio = (areaId) => api(`/api/areas/${areaId}/resumen`)

// --- materiales del espacio: carpetas con enlaces y archivos ---
export const listarCarpetas = (areaId) => api(`/api/areas/${areaId}/carpetas`)
export const crearCarpeta = (areaId, nombre) =>
  api(`/api/areas/${areaId}/carpetas`, { method: 'POST', body: { nombre } })
export const renombrarCarpeta = (id, nombre) =>
  api(`/api/carpetas/${id}`, { method: 'PUT', body: { nombre } })
export const eliminarCarpeta = (id) => api(`/api/carpetas/${id}`, { method: 'DELETE' })
export const crearMaterialEnlace = (carpetaId, body) =>
  api(`/api/carpetas/${carpetaId}/materiales`, { method: 'POST', body })
/** Un material que es un archivo se crea con su contenido en un solo paso. */
export const subirMaterialArchivo = (carpetaId, archivo, titulo) =>
  apiSubirArchivo(`/api/carpetas/${carpetaId}/materiales/archivo`, archivo, {
    method: 'POST',
    campos: { titulo },
  })
export const editarMaterial = (id, body) => api(`/api/materiales/${id}`, { method: 'PUT', body })
export const eliminarMaterial = (id) => api(`/api/materiales/${id}`, { method: 'DELETE' })
export const descargarMaterial = (material) =>
  apiDescargarArchivo(`/api/materiales/${material.id}/archivo`, material.archivoNombre)

// --- sesiones del espacio (clases con enlace para todos los miembros) ---
export const listarSesiones = (areaId) => api(`/api/areas/${areaId}/sesiones`)
export const crearSesion = (areaId, body) =>
  api(`/api/areas/${areaId}/sesiones`, { method: 'POST', body })
export const actualizarSesion = (id, body) => api(`/api/sesiones/${id}`, { method: 'PUT', body })
export const eliminarSesion = (id) => api(`/api/sesiones/${id}`, { method: 'DELETE' })

/** Sesiones del espacio y asesorías programadas del usuario, la más próxima primero. */
export const proximasReuniones = () => api('/api/reuniones/proximas')

/** El profesor y los alumnos agrupados por grupo; qué se ve depende de quién mira. */
export const verPersonas = (areaId) => api(`/api/areas/${areaId}/personas`)

// --- avisos del Tablón ---
export const listarAvisos = (areaId) => api(`/api/areas/${areaId}/avisos`)
export const crearAviso = (areaId, texto) =>
  api(`/api/areas/${areaId}/avisos`, { method: 'POST', body: { texto } })
export const eliminarAviso = (id) => api(`/api/avisos/${id}`, { method: 'DELETE' })

// --- Dashboard del profesor: agregado sobre todas sus clases ---
export const obtenerDashboardAsesor = () => api('/api/dashboard/asesor')

// --- asesorías privadas (uno a uno, fuera de una clase) ---
export const listarAsesorados = () => api('/api/asesorados')
/** "¿Das asesorías privadas?" Devuelve el perfil ya actualizado. */
export const cambiarAsesoriasPrivadas = (valor) =>
  api('/api/auth/me/asesorias-privadas', { method: 'PUT', body: { valor } })

// --- vista previa de archivos (solo imágenes y PDF verificados por el backend) ---
export const rutaArchivoMaterial = (materialId) => `/api/materiales/${materialId}/archivo`
export const rutaArchivoEntrega = (entregaId) => `/api/entregas/${entregaId}/archivo`

// --- panel de asesorados (ver listarAsesorados arriba) ---

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
/** El documento se guarda en la base; se sube aparte del alta de la entrega. */
export const subirArchivoEntrega = (entregaId, archivo) =>
  apiSubirArchivo(`/api/entregas/${entregaId}/archivo`, archivo)
export const descargarArchivoEntrega = (entregaId, nombre) =>
  apiDescargarArchivo(`/api/entregas/${entregaId}/archivo`, nombre)
export const cambiarEstadoEntrega = (entregaId, estado) =>
  api(`/api/entregas/${entregaId}/estado`, { method: 'PATCH', body: { estado } })

export const listarObservaciones = (entregaId) => api(`/api/entregas/${entregaId}/observaciones`)
export const crearObservacion = (entregaId, descripcion) =>
  api(`/api/entregas/${entregaId}/observaciones`, { method: 'POST', body: { descripcion } })
export const cambiarEstadoObservacion = (id, estado) =>
  api(`/api/observaciones/${id}/estado`, { method: 'PATCH', body: { estado } })

// --- asesorías y acuerdos ---
export const listarAsesorias = (proyectoId) => api(`/api/proyectos/${proyectoId}/asesorias`)
export const crearAsesoria = (proyectoId, body) =>
  api(`/api/proyectos/${proyectoId}/asesorias`, { method: 'POST', body })
/** Reprogramar una asesoría que todavía está programada. */
export const actualizarAsesoria = (id, body) =>
  api(`/api/asesorias/${id}`, { method: 'PUT', body })
/** `PROGRAMADA → REALIZADA | CANCELADA`; el resumen se completa al marcarla realizada. */
export const cambiarEstadoAsesoria = (id, estado, resumen) =>
  api(`/api/asesorias/${id}/estado`, { method: 'PATCH', body: { estado, resumen } })
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
