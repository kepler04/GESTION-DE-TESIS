package com.tesistrack.dto;

import com.tesistrack.model.Area;

/**
 * Lo que ve el estudiante antes de confirmar que se suma: a quién y a qué espacio
 * entra. No incluye el código — quien consulta ya lo tiene.
 */
public record InvitacionDto(String area, String asesor, String asesorEmail) {

    public static InvitacionDto from(Area area) {
        return new InvitacionDto(
            area.getNombre(),
            area.getPropietario().getName(),
            area.getPropietario().getEmail());
    }
}
