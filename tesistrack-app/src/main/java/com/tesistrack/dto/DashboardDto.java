package com.tesistrack.dto;

import java.util.List;

/**
 * Resumen de un proyecto, según lo que pide Funcionalidades.md:
 * estado, próximos hitos, tareas pendientes, última entrega,
 * observaciones pendientes y últimas asesorías.
 */
public record DashboardDto(
    ProyectoDto proyecto,
    List<HitoDto> proximosHitos,
    List<TareaDto> tareasPendientes,
    EntregaDto ultimaEntrega,
    List<ObservacionDto> observacionesPendientes,
    List<AsesoriaDto> ultimasAsesorias
) {
}
