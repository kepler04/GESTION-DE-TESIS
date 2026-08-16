package com.tesistrack.dto;

import java.time.LocalDate;

import com.tesistrack.model.EstadoHito;
import com.tesistrack.model.Hito;

public record HitoDto(
    Long id,
    Long proyectoId,
    String nombre,
    String descripcion,
    LocalDate fechaLimite,
    EstadoHito estado,
    Integer orden
) {

    public static HitoDto from(Hito hito) {
        return new HitoDto(
            hito.getId(),
            hito.getProyecto().getId(),
            hito.getNombre(),
            hito.getDescripcion(),
            hito.getFechaLimite(),
            hito.getEstado(),
            hito.getOrden());
    }
}
