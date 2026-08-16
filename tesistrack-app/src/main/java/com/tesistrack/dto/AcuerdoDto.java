package com.tesistrack.dto;

import java.time.Instant;

import com.tesistrack.model.Acuerdo;

public record AcuerdoDto(Long id, Long asesoriaId, String descripcion, Instant createdAt) {

    public static AcuerdoDto from(Acuerdo acuerdo) {
        return new AcuerdoDto(
            acuerdo.getId(),
            acuerdo.getAsesoria().getId(),
            acuerdo.getDescripcion(),
            acuerdo.getCreatedAt());
    }
}
