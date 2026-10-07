package com.tesistrack.dto;

import java.time.Instant;

import com.tesistrack.model.SesionEspacio;

public record SesionDto(Long id, Long areaId, String titulo, Instant fechaHora, String enlace, Instant createdAt) {

    public static SesionDto from(SesionEspacio sesion) {
        return new SesionDto(
            sesion.getId(),
            sesion.getArea().getId(),
            sesion.getTitulo(),
            sesion.getFechaHora(),
            sesion.getEnlace(),
            sesion.getCreatedAt());
    }
}
