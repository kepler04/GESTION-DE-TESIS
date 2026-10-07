package com.tesistrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.Entrega;
import com.tesistrack.model.EstadoEntrega;

public interface EntregaRepository extends JpaRepository<Entrega, Long> {

    List<Entrega> findByHitoIdOrderByVersionAsc(Long hitoId);

    /** Última versión entregada de un hito, para calcular el número de la siguiente. */
    Optional<Entrega> findFirstByHitoIdOrderByVersionDesc(Long hitoId);

    /** Un hito con entregas no se puede borrar (Decisión 4). */
    boolean existsByHitoId(Long hitoId);

    /** Última entrega de todo el proyecto, para el dashboard. */
    Optional<Entrega> findFirstByHitoProyectoIdOrderByCreatedAtDesc(Long proyectoId);

    /** Todas las entregas de un proyecto, para poder borrarlo entero. */
    List<Entrega> findByHitoProyectoId(Long proyectoId);

    /** Las entregas de ese estado en todas las tesis de un asesor (por ejemplo, las que esperan revisión). */
    List<Entrega> findByEstadoAndHitoProyectoAsesorId(EstadoEntrega estado, Long asesorId);
}
