package com.tesistrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.Area;

public interface AreaRepository extends JpaRepository<Area, Long> {

    List<Area> findByPropietarioIdOrderByNombreAsc(Long propietarioId);

    boolean existsByPropietarioIdAndNombreIgnoreCase(Long propietarioId, String nombre);

    Optional<Area> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);
}
