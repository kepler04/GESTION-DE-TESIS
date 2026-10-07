package com.tesistrack.dto;

import java.time.Instant;
import java.util.List;

/**
 * El Dashboard del profesor: un panel **agregado** sobre todas sus clases, no la
 * vista de una sola tesis (que es la del estudiante). Responde "¿qué tengo que
 * mirar hoy?": cómo viene cada clase, qué entregas esperan su revisión y qué grupos
 * necesitan atención.
 *
 * <p>Se arma solo con las tesis donde el usuario es el asesor y las clases de las
 * que es dueño: nunca toca datos de otro profesor.
 */
public record DashboardAsesorDto(
    List<ClaseDto> clases,
    List<RevisionDto> paraRevisar,
    List<AtencionDto> necesitanAtencion
) {

    /** Una tarjeta de "Mis clases": cuántos son y cómo vienen, en tres colores. */
    public record ClaseDto(
        Long id,
        String nombre,
        long alumnos,
        long grupos,
        int verde,
        int amarillo,
        int rojo,
        int sinActividad) {
    }

    /**
     * Una entrega que espera revisión. {@code clase} va en {@code null} cuando la
     * tesis es una asesoría privada (no está en ninguna clase).
     */
    public record RevisionDto(
        Long entregaId,
        Long hitoId,
        String hito,
        int version,
        Instant desde,
        Long proyectoId,
        String tesis,
        List<String> alumnos,
        Long areaId,
        String clase) {
    }

    /** Un grupo que necesita atención: atrasado y/o todavía sin tema. */
    public record AtencionDto(
        Long proyectoId,
        String tesis,
        List<String> alumnos,
        Long areaId,
        String clase,
        SemaforoGrupo semaforo,
        int hitosEnFalta,
        boolean sinTema) {
    }
}
