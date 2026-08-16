package com.tesistrack.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Consigna que el asesor reparte a todo un área. */
public record ActividadRequest(
    @NotBlank @Size(max = 255) String nombre,
    String descripcion,
    LocalDate fechaLimite,
    Integer orden
) {
}
