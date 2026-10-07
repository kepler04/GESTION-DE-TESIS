package com.tesistrack.dto;

import java.time.Instant;

import com.tesistrack.model.EstadoAsesoria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * {@code estado} es opcional y por defecto {@code REALIZADA}: así sigue funcionando
 * el registro de una reunión que ya ocurrió (y la consulta del estudiante). Para
 * agendar una reunión se manda {@code PROGRAMADA}, con su fecha y, si la hay, el
 * enlace. {@code CANCELADA} no es un estado de nacimiento.
 */
public record CrearAsesoriaRequest(
    @NotNull Instant fecha,
    @NotBlank @Size(max = 255) String tema,
    String resumen,
    EstadoAsesoria estado,
    @Size(max = 1000) String enlace
) {
}
