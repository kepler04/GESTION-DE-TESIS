package com.tesistrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MensajeRequest(
    @NotBlank(message = "El mensaje está vacío")
    @Size(max = 2000, message = "El mensaje es demasiado largo (máximo 2000 caracteres)") String texto
) {

    public MensajeRequest {
        texto = texto == null ? null : texto.trim();
    }
}
