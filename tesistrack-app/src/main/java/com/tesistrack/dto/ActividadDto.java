package com.tesistrack.dto;

import java.time.LocalDate;

import com.tesistrack.model.Actividad;

public record ActividadDto(
    Long id,
    String nombre,
    String descripcion,
    LocalDate fechaLimite,
    Integer orden) {

    public static ActividadDto from(Actividad actividad) {
        if (actividad == null) {
            return null;
        }
        return new ActividadDto(
            actividad.getId(),
            actividad.getNombre(),
            actividad.getDescripcion(),
            actividad.getFechaLimite(),
            actividad.getOrden());
    }
}
