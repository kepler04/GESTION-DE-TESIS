package com.tesistrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Alta de un material que es un enlace. El archivo va por multipart, aparte. */
public record MaterialEnlaceRequest(
    @NotBlank @Size(max = 160, message = "El título es demasiado largo") String titulo,
    @NotBlank @Size(max = 1000, message = "El enlace es demasiado largo") String url
) {
}
