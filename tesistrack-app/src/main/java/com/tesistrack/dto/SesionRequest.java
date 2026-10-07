package com.tesistrack.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SesionRequest(
    @NotBlank @Size(max = 160, message = "El título es demasiado largo") String titulo,
    @NotNull Instant fechaHora,
    @NotBlank @Size(max = 1000, message = "El enlace es demasiado largo") String enlace
) {
}
