package com.tesistrack.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * El asesor es opcional: el proyecto puede crearse y asignarse después.
 *
 * Hay dos formas de llegar con asesor: elegirlo de la lista ({@code asesorId}) o
 * pegar el código que el asesor le pasó al estudiante ({@code codigoInvitacion}),
 * que además lo deja dentro del área correspondiente.
 */
public record CrearProyectoRequest(
    @NotBlank String titulo,
    String descripcion,
    Long asesorId,
    String codigoInvitacion
) {
}
