package com.tesistrack.dto;

import com.tesistrack.model.EstadoAsesoria;

import jakarta.validation.constraints.NotNull;

/** {@code resumen} se completa al marcarla {@code REALIZADA}; en otros estados se ignora. */
public record CambiarEstadoAsesoriaRequest(@NotNull EstadoAsesoria estado, String resumen) {
}
