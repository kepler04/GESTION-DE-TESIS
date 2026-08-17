package com.tesistrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.EstadoObservacion;
import com.tesistrack.model.Observacion;

public interface ObservacionRepository extends JpaRepository<Observacion, Long> {

    List<Observacion> findByEntregaId(Long entregaId);

    /** Observaciones de todo un proyecto filtradas por estado, para el dashboard. */
    List<Observacion> findByEntregaHitoProyectoIdAndEstado(Long proyectoId, EstadoObservacion estado);

    /** Todas las observaciones de un proyecto, para poder borrarlo entero. */
    List<Observacion> findByEntregaHitoProyectoId(Long proyectoId);
}
