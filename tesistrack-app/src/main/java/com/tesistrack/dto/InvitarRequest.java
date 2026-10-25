package com.tesistrack.dto;

import jakarta.validation.constraints.NotNull;

public record InvitarRequest(@NotNull(message = "Elegí a quién invitar") Long estudianteId) {
}
