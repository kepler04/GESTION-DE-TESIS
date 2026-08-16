package com.tesistrack.dto;

import java.time.Instant;

import com.tesistrack.model.EstadoObservacion;
import com.tesistrack.model.Observacion;

public record ObservacionDto(
    Long id,
    Long entregaId,
    String descripcion,
    EstadoObservacion estado,
    UserDto registradaPor,
    Instant createdAt
) {

    public static ObservacionDto from(Observacion observacion) {
        return new ObservacionDto(
            observacion.getId(),
            observacion.getEntrega().getId(),
            observacion.getDescripcion(),
            observacion.getEstado(),
            UserDto.from(observacion.getRegistradaPor()),
            observacion.getCreatedAt());
    }
}
