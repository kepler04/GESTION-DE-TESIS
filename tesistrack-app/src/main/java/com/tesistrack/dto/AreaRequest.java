package com.tesistrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AreaRequest(
    @NotBlank @Size(max = 80, message = "El nombre del área es demasiado largo") String nombre
) {

    public AreaRequest {
        nombre = nombre == null ? null : nombre.trim();
    }
}
