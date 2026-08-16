package com.tesistrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.Actividad;

public interface ActividadRepository extends JpaRepository<Actividad, Long> {

    List<Actividad> findByAreaIdOrderByOrdenAsc(Long areaId);

    boolean existsByAreaIdAndNombreIgnoreCase(Long areaId, String nombre);
}
