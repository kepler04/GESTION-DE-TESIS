package com.tesistrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Registrar el tema de una tesis que estaba por definir (Decisión 29). */
public record TemaRequest(
    @NotBlank(message = "Escribí el tema de tu tesis")
    @Size(max = 255, message = "El tema es demasiado largo (máximo 255 caracteres)") String titulo,
    String descripcion
) {

    public TemaRequest {
        titulo = titulo == null ? null : titulo.trim();
    }
}
