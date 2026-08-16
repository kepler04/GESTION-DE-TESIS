package com.tesistrack.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CrearAsesoriaRequest(
    @NotNull Instant fecha,
    @NotBlank String tema,
    String resumen
) {
}
