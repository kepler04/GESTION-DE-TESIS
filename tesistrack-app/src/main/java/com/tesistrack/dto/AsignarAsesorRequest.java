package com.tesistrack.dto;

import jakarta.validation.constraints.NotNull;

public record AsignarAsesorRequest(@NotNull Long asesorId) {
}
