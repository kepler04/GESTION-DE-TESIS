package com.tesistrack.dto;

import java.time.Instant;

import com.tesistrack.model.EstadoObservacion;
import com.tesistrack.model.Observacion;

public record ObservacionDto(
    Long id,
    Long entregaId,
    /** El hito de la entrega observada: el estudiante la corrige subiendo otra versión ahí. */
    Long hitoId,
    String hitoNombre,
    String descripcion,
    EstadoObservacion estado,
    UserDto registradaPor,
    Instant createdAt
) {

    public static ObservacionDto from(Observacion observacion) {
        return new ObservacionDto(
            observacion.getId(),
            observacion.getEntrega().getId(),
            observacion.getEntrega().getHito().getId(),
            observacion.getEntrega().getHito().getNombre(),
            observacion.getDescripcion(),
            observacion.getEstado(),
            UserDto.from(observacion.getRegistradaPor()),
            observacion.getCreatedAt());
    }
}
