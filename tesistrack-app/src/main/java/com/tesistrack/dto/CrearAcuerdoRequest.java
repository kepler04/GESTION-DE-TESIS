package com.tesistrack.dto;

import jakarta.validation.constraints.NotBlank;

public record CrearAcuerdoRequest(@NotBlank String descripcion) {
}
