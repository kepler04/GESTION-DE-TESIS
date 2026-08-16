package com.tesistrack.dto;

import com.tesistrack.model.Area;

/**
 * El {@code codigo} solo se incluye cuando el área se devuelve a su dueño
 * ({@link #from}). Cuando viaja adentro de un proyecto —que el estudiante también
 * ve— se usa {@link #sinCodigo}: el código es la llave para sumarse al espacio del
 * asesor, y no tiene por qué circular en cada respuesta.
 */
public record AreaDto(Long id, String nombre, String codigo) {

    public static AreaDto from(Area area) {
        return area == null ? null : new AreaDto(area.getId(), area.getNombre(), area.getCodigo());
    }

    public static AreaDto sinCodigo(Area area) {
        return area == null ? null : new AreaDto(area.getId(), area.getNombre(), null);
    }
}
