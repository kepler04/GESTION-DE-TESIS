package com.tesistrack.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;

/**
 * El asesor es opcional: el proyecto puede crearse y asignarse después.
 *
 * Hay dos formas de llegar con asesor: elegirlo de la lista ({@code asesorId}) o
 * pegar el código que el asesor le pasó al estudiante ({@code codigoInvitacion}),
 * que además lo deja dentro del área correspondiente.
 */
public record CrearProyectoRequest(
    /** Vacío o ausente = tema por definir (Decisión 29). */
    @Size(max = 255, message = "El tema es demasiado largo (máximo 255 caracteres)") String titulo,
    String descripcion,
    Long asesorId,
    String codigoInvitacion,
    /** Opcional: si no viene, la tesis arranca hoy. */
    LocalDate fechaInicio,
    /** true = "En grupo": abre la tesis a compañeros. Ausente = individual. */
    Boolean grupal
) {
}
