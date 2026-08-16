package com.tesistrack.dto;

import jakarta.validation.constraints.NotBlank;

/** El número de versión no se envía: lo calcula el backend a partir de la última entrega del hito. */
public record CrearEntregaRequest(
    @NotBlank String archivoNombre,
    String archivoUrl,
    String comentario
) {
}
