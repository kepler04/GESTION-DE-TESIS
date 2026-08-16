package com.tesistrack.dto;

import jakarta.validation.constraints.NotBlank;

/** Código con el que un estudiante suma su tesis al espacio de un asesor. */
public record UnirseRequest(@NotBlank String codigo) {
}
