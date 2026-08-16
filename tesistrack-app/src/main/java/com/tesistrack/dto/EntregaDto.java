package com.tesistrack.dto;

import java.time.Instant;

import com.tesistrack.model.Entrega;

public record EntregaDto(
    Long id,
    Long hitoId,
    Integer version,
    String archivoNombre,
    String archivoUrl,
    String comentario,
    UserDto entregadaPor,
    Instant createdAt
) {

    public static EntregaDto from(Entrega entrega) {
        return new EntregaDto(
            entrega.getId(),
            entrega.getHito().getId(),
            entrega.getVersion(),
            entrega.getArchivoNombre(),
            entrega.getArchivoUrl(),
            entrega.getComentario(),
            UserDto.from(entrega.getEntregadaPor()),
            entrega.getCreatedAt());
    }
}
