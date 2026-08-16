package com.tesistrack.dto;

/**
 * Una fila del panel de asesorados: un estudiante, su tesis y qué necesita
 * atención.
 *
 * Responde la pregunta con la que el asesor abre la app: <i>¿a quién le tengo que
 * prestar atención hoy?</i> Por eso son contadores de pendientes y no un resumen
 * de todo lo hecho.
 */
public record AsesoradoDto(
    UserDto estudiante,
    Long proyectoId,
    String titulo,
    AreaDto area,
    /** Hito más temprano que todavía no está completado; null si no quedan. */
    HitoDto hitoActual,
    int hitosCompletados,
    int hitosTotales,
    /** Hitos entregados esperando revisión del asesor. */
    int entregasPorRevisar,
    int observacionesPendientes,
    int tareasVencidas
) {

    /** Nada que atender: sin entregas esperando, sin observaciones abiertas ni tareas vencidas. */
    public boolean alDia() {
        return entregasPorRevisar == 0 && observacionesPendientes == 0 && tareasVencidas == 0;
    }
}
