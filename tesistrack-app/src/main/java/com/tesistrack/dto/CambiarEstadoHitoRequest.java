package com.tesistrack.dto;

import com.tesistrack.model.EstadoHito;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoHitoRequest(@NotNull EstadoHito estado) {
}
