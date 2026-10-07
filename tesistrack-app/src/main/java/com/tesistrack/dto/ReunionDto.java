package com.tesistrack.dto;

import java.time.Instant;

/**
 * Una próxima reunión del usuario, venga de donde venga: una sesión de su espacio
 * ({@code SESION}) o una asesoría programada de una de sus tesis ({@code ASESORIA}).
 * El Dashboard las muestra juntas con un botón Unirse.
 */
public record ReunionDto(
    String tipo,
    Long id,
    String titulo,
    Instant fechaHora,
    String enlace,
    Long areaId,
    String areaNombre,
    Long proyectoId,
    String proyectoTitulo
) {
    public static final String SESION = "SESION";
    public static final String ASESORIA = "ASESORIA";
}
