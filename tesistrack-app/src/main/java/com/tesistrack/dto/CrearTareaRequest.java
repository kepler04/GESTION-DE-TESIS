package com.tesistrack.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

/** {@code acuerdoId} es opcional: permite tareas sueltas además de las derivadas de un acuerdo. */
public record CrearTareaRequest(
    @NotBlank String descripcion,
    Long acuerdoId,
    Long responsableId,
    LocalDate fechaLimite
) {
}
