package com.tesistrack.dto;

import java.time.Instant;

import com.tesistrack.model.Mensaje;

/** Un mensaje de la conversación. {@code propio} es si lo mandó quien lo está leyendo. */
public record MensajeDto(Long id, Long remitenteId, String texto, Instant createdAt, Instant leidoAt, boolean propio) {

    public static MensajeDto from(Mensaje m, Long lector) {
        return new MensajeDto(
            m.getId(),
            m.getRemitente().getId(),
            m.getTexto(),
            m.getCreatedAt(),
            m.getLeidoAt(),
            m.getRemitente().getId().equals(lector));
    }
}
