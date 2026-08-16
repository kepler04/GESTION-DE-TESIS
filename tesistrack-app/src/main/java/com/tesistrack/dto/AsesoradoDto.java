package com.tesistrack.dto;

import java.util.List;

/**
 * Una fila del panel de asesorados: una tesis, quiénes la hacen y qué necesita
 * atención.
 *
 * Responde la pregunta con la que el asesor abre la app: <i>¿a quién le tengo que
 * prestar atención hoy?</i> Por eso son contadores de pendientes y no un resumen
 * de todo lo hecho.
 *
 * <p>La ficha es de la <b>tesis</b>, no de la persona: una tesis grupal aparece una
 * sola vez con sus integrantes juntos, porque su avance es uno solo.
 */
public record AsesoradoDto(
    List<UserDto> estudiantes,
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
