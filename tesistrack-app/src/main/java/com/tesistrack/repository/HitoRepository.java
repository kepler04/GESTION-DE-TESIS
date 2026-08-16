package com.tesistrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.Hito;

public interface HitoRepository extends JpaRepository<Hito, Long> {

    List<Hito> findByProyectoIdOrderByOrdenAsc(Long proyectoId);

    /** Guarda contra repartir dos veces la misma actividad al mismo proyecto. */
    boolean existsByProyectoIdAndActividadId(Long proyectoId, Long actividadId);

    List<Hito> findByActividadId(Long actividadId);

    /** Todos los hitos de los proyectos de un área, para armar el tablero de una sola vez. */
    List<Hito> findByProyectoAreaId(Long areaId);
}
