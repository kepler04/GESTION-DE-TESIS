package com.tesistrack.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

/** Se usa igual para crear y para editar un hito. */
public record HitoRequest(
    @NotBlank String nombre,
    String descripcion,
    LocalDate fechaLimite,
    Integer orden
) {
}
