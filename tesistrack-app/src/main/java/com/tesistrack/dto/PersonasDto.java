package com.tesistrack.dto;

import java.time.Instant;
import java.util.List;

/**
 * La pestaña Personas de una clase: el profesor arriba y los alumnos agrupados por
 * grupo.
 *
 * <p>Lo que se ve depende de quién mira. El **profesor** (y el coordinador, que lee
 * todo) ve cada grupo completo: correos, tema, semáforo y fecha de ingreso. Un
 * **estudiante** ve solo los **nombres** de los demás grupos —sin correos, sin
 * tema, sin semáforo: un estado comparado con el de sus compañeros no es asunto
 * suyo— y los datos de su propio grupo, salvo el semáforo.
 */
public record PersonasDto(UserDto profesor, List<GrupoDto> grupos, boolean detalle) {

    /**
     * @param proyectoId solo para quien ve el detalle o para el propio grupo; en los
     *     demás grupos va en {@code null}
     * @param tema el título de la tesis; {@code null} si todavía no tiene (y también
     *     en los grupos ajenos, cuyo tema no se muestra)
     * @param semaforo solo lo ve el profesor
     * @param ingreso cuándo entró el grupo a la clase
     * @param propio si es el grupo de quien está mirando
     */
    public record GrupoDto(
        Long proyectoId,
        String tema,
        SemaforoGrupo semaforo,
        Instant ingreso,
        boolean propio,
        List<AlumnoDto> alumnos) {
    }

    /** {@code email} va en {@code null} cuando quien mira no tiene por qué verlo. */
    public record AlumnoDto(Long id, String nombre, String email) {
    }
}
