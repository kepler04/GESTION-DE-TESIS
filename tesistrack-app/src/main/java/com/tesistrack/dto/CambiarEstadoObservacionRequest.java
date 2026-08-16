package com.tesistrack.dto;

import com.tesistrack.model.EstadoObservacion;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoObservacionRequest(@NotNull EstadoObservacion estado) {
}
