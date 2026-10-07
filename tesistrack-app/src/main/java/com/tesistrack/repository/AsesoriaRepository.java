package com.tesistrack.repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.Asesoria;
import com.tesistrack.model.EstadoAsesoria;

public interface AsesoriaRepository extends JpaRepository<Asesoria, Long> {

    List<Asesoria> findByProyectoIdOrderByFechaDesc(Long proyectoId);

    List<Asesoria> findByProyectoIdAndEstadoOrderByFechaDesc(Long proyectoId, EstadoAsesoria estado);

    /** Las programadas de varias tesis desde cierta fecha, la más próxima primero. */
    List<Asesoria> findByProyectoIdInAndEstadoAndFechaGreaterThanEqualOrderByFechaAsc(
        Collection<Long> proyectoIds, EstadoAsesoria estado, Instant desde);
}
