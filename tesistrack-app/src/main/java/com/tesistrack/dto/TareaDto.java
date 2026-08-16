package com.tesistrack.dto;

import java.time.Instant;
import java.time.LocalDate;

import com.tesistrack.model.Tarea;

public record TareaDto(
    Long id,
    Long proyectoId,
    Long acuerdoId,
    String descripcion,
    UserDto responsable,
    LocalDate fechaLimite,
    boolean completada,
    Instant completadaAt
) {

    public static TareaDto from(Tarea tarea) {
        return new TareaDto(
            tarea.getId(),
            tarea.getProyecto().getId(),
            tarea.getAcuerdo() == null ? null : tarea.getAcuerdo().getId(),
            tarea.getDescripcion(),
            tarea.getResponsable() == null ? null : UserDto.from(tarea.getResponsable()),
            tarea.getFechaLimite(),
            tarea.isCompletada(),
            tarea.getCompletadaAt());
    }
}
