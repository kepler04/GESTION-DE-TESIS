package com.tesistrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AvisoRequest(
    @NotBlank @Size(max = 2000, message = "El aviso es demasiado largo (máximo 2000 caracteres)") String texto
) {

    public AvisoRequest {
        texto = texto == null ? null : texto.trim();
    }
}
