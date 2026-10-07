package com.tesistrack.dto;

import java.time.Instant;
import java.time.LocalDate;
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

    /**
     * Una tarjeta de "Mis clases": cuántos son, cómo vienen (en los cuatro estados del
     * semáforo) y la próxima sesión, si hay. {@code proximaSesion} va en {@code null}
     * cuando no hay ninguna programada.
     */
    public record ClaseDto(
        Long id,
        String nombre,
        String codigo,
        long alumnos,
        long grupos,
        int verde,
        int amarillo,
        int rojo,
        int sinActividad,
        SesionDto proximaSesion) {
    }

    /** La próxima sesión de una clase, con su enlace para el botón Unirse. */
    public record SesionDto(Long id, String titulo, Instant fechaHora, String enlace) {
    }

    /**
     * Una entrega que espera revisión. {@code clase} va en {@code null} cuando la
     * tesis es una asesoría privada (no está en ninguna clase). {@code entrega} trae
     * el tipo de archivo verificado, para abrirla en el visor sin salir del Dashboard.
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
        String clase,
        EntregaDto entrega) {
    }

    /**
     * Un grupo que necesita atención: atrasado, en riesgo y/o todavía sin tema. Trae el
     * motivo con números, para que la tarjeta diga <i>por qué</i> y no solo un color.
     * {@code proximoHito} y {@code proximoVence} describen el hito que vence pronto sin
     * entrega, si lo hay.
     */
    public record AtencionDto(
        Long proyectoId,
        String tesis,
        List<String> alumnos,
        Long areaId,
        String clase,
        SemaforoGrupo semaforo,
        int hitosEnFalta,
        int hitosObservados,
        String proximoHito,
        LocalDate proximoVence,
        boolean sinTema) {
    }
}
