package com.tesistrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CarpetaRequest(
    @NotBlank @Size(max = 80, message = "El nombre de la carpeta es demasiado largo") String nombre
) {

    public CarpetaRequest {
        nombre = nombre == null ? null : nombre.trim();
    }
}
