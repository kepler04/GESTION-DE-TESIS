package com.tesistrack.dto;

import java.util.List;

/**
 * Resumen de un proyecto, según lo que pide Funcionalidades.md:
 * estado, próximos hitos, tareas pendientes, última entrega,
 * observaciones pendientes y últimas asesorías.
 *
 * <p>{@code semaforo} es el del grupo entero (Decisión 26): el estudiante ve el de su
 * propia tesis; el de los otros grupos de la clase no se le muestra (Decisión 22).
 */
public record DashboardDto(
    ProyectoDto proyecto,
    List<HitoDto> proximosHitos,
    List<TareaDto> tareasPendientes,
    EntregaDto ultimaEntrega,
    List<ObservacionDto> observacionesPendientes,
    List<AsesoriaDto> ultimasAsesorias,
    SemaforoGrupo semaforo
) {
}
