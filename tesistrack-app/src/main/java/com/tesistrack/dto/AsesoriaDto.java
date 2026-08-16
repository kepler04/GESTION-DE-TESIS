package com.tesistrack.dto;

import java.time.Instant;

import com.tesistrack.model.Asesoria;

public record AsesoriaDto(
    Long id,
    Long proyectoId,
    Instant fecha,
    String tema,
    String resumen,
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
            UserDto.from(asesoria.getRegistradaPor()),
            asesoria.getCreatedAt());
    }
}
