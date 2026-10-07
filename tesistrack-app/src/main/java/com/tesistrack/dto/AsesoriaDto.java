package com.tesistrack.dto;

import java.time.Instant;

import com.tesistrack.model.Asesoria;
import com.tesistrack.model.EstadoAsesoria;

public record AsesoriaDto(
    Long id,
    Long proyectoId,
    Instant fecha,
    String tema,
    String resumen,
    EstadoAsesoria estado,
    String enlace,
    UserDto registradaPor,
    Instant createdAt
) {

    public static AsesoriaDto from(Asesoria asesoria) {
        return new AsesoriaDto(
            asesoria.getId(),
            asesoria.getProyecto().getId(),
            asesoria.getFecha(),
            asesoria.getTema(),
            asesoria.getResumen(),
            asesoria.getEstado(),
            asesoria.getEnlace(),
            UserDto.from(asesoria.getRegistradaPor()),
            asesoria.getCreatedAt());
    }
}
