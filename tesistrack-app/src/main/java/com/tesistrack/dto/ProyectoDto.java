package com.tesistrack.dto;

import java.time.Instant;

import com.tesistrack.model.EstadoProyecto;
import com.tesistrack.model.Proyecto;

public record ProyectoDto(
    Long id,
    String titulo,
    String descripcion,
    EstadoProyecto estado,
    UserDto estudiante,
    UserDto asesor,
    Instant createdAt
) {

    public static ProyectoDto from(Proyecto proyecto) {
        return new ProyectoDto(
            proyecto.getId(),
            proyecto.getTitulo(),
            proyecto.getDescripcion(),
            proyecto.getEstado(),
            UserDto.from(proyecto.getEstudiante()),
            proyecto.getAsesor() == null ? null : UserDto.from(proyecto.getAsesor()),
            proyecto.getCreatedAt());
    }
}
