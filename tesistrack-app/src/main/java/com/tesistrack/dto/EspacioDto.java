package com.tesistrack.dto;

import com.tesistrack.model.Area;

/**
 * Lo que un miembro necesita para abrir la página de un espacio. El código de
 * invitación solo viaja si quien pregunta es el dueño: es la llave del espacio.
 */
public record EspacioDto(AreaDto area, UserDto asesor, boolean propietario) {

    public static EspacioDto from(Area area, boolean propietario) {
        return new EspacioDto(
            propietario ? AreaDto.from(area) : AreaDto.sinCodigo(area),
            UserDto.from(area.getPropietario()),
            propietario);
    }
}
