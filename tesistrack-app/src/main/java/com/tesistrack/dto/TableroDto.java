package com.tesistrack.dto;

import java.util.List;

import com.tesistrack.model.EstadoHito;

/**
 * Grilla del espacio: una fila por estudiante, una columna por actividad.
 *
 * <p>Las columnas viajan aparte de las celdas para que el frontend no tenga que
 * deducir el orden a partir de las filas — un estudiante que entró tarde podría no
 * tener todas las actividades.
 */
public record TableroDto(
    AreaDto area,
    List<ActividadDto> actividades,
    List<FilaDto> filas) {

    /**
     * Una tesis del espacio y su estado en cada actividad.
     *
     * <p>La fila es del <b>proyecto</b>, no de la persona: una tesis grupal ocupa
     * una sola fila con sus integrantes juntos, porque entregan una sola vez.
     */
    public record FilaDto(
        List<UserDto> estudiantes,
        Long proyectoId,
        String titulo,
        List<CeldaDto> celdas,
        int enFalta,
        int porRevisar) {
    }

    /**
     * El cruce estudiante × actividad. {@code hitoId} y {@code estado} van en null
     * cuando el estudiante no tiene esa actividad repartida.
     */
    public record CeldaDto(
        Long actividadId,
        Long hitoId,
        EstadoHito estado,
        Semaforo semaforo) {
    }
}
