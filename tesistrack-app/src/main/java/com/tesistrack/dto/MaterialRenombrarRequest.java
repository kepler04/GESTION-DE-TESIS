package com.tesistrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Edita un material. El título siempre; {@code url} solo si el material es un
 * enlace (a un archivo no se le puede poner enlace: dejaría de cumplir el CHECK).
 */
public record MaterialRenombrarRequest(
    @NotBlank @Size(max = 160, message = "El título es demasiado largo") String titulo,
    @Size(max = 1000, message = "El enlace es demasiado largo") String url
) {
}
