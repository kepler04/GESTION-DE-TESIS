package com.tesistrack.dto;

import java.time.Instant;

import com.tesistrack.model.Aviso;

public record AvisoDto(Long id, Long areaId, String texto, Instant createdAt) {

    public static AvisoDto from(Aviso aviso) {
        return new AvisoDto(aviso.getId(), aviso.getArea().getId(), aviso.getTexto(), aviso.getCreatedAt());
    }
}
