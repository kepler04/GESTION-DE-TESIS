package com.tesistrack.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import com.tesistrack.model.EstadoProyecto;
import com.tesistrack.model.Proyecto;

public record ProyectoDto(
    Long id,
    String titulo,
    String descripcion,
    EstadoProyecto estado,
    /** Una tesis puede ser grupal; la lista nunca viene vacía. */
    List<UserDto> estudiantes,
    UserDto asesor,
    /** Etiqueta del asesor para agrupar sus tesis; null si no le puso ninguna. */
    AreaDto area,
    LocalDate fechaInicio,
    Instant createdAt
) {

    public static ProyectoDto from(Proyecto proyecto) {
        return new ProyectoDto(
            proyecto.getId(),
            proyecto.getTitulo(),
            proyecto.getDescripcion(),
            proyecto.getEstado(),
            proyecto.getEstudiantesOrdenados().stream().map(UserDto::from).toList(),
            proyecto.getAsesor() == null ? null : UserDto.from(proyecto.getAsesor()),
            // Sin código: este DTO también lo recibe el estudiante.
            AreaDto.sinCodigo(proyecto.getArea()),
            proyecto.getFechaInicio(),
            proyecto.getCreatedAt());
    }
}
