package com.tesistrack.dto;

import jakarta.validation.constraints.NotBlank;

public record CrearObservacionRequest(@NotBlank String descripcion) {
}
