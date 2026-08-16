package com.tesistrack.dto;

import jakarta.validation.constraints.NotBlank;

/** El asesor es opcional: el proyecto puede crearse y asignarse después. */
public record CrearProyectoRequest(
    @NotBlank String titulo,
    String descripcion,
    Long asesorId
) {
}
