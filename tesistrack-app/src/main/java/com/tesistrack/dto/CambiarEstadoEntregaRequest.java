package com.tesistrack.dto;

import com.tesistrack.model.EstadoEntrega;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoEntregaRequest(@NotNull EstadoEntrega estado) {
}
