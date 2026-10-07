package com.tesistrack.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Reprogramar una asesoría que todavía está {@code PROGRAMADA}: otra fecha, tema o enlace. */
public record ActualizarAsesoriaRequest(
    @NotNull Instant fecha,
    @NotBlank @Size(max = 255) String tema,
    @Size(max = 1000) String enlace
) {
}
