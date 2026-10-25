package com.tesistrack.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/** El tope de integrantes de los grupos de una clase (Decisión 30). */
public record TopeRequest(
    @Min(value = 1, message = "El tope mínimo es 1")
    @Max(value = 10, message = "El tope máximo es 10") int tope) {
}
