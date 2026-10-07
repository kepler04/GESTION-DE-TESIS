package com.tesistrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.CarpetaMaterial;

public interface CarpetaMaterialRepository extends JpaRepository<CarpetaMaterial, Long> {

    List<CarpetaMaterial> findByAreaIdOrderByOrdenAscIdAsc(Long areaId);

    Optional<CarpetaMaterial> findFirstByAreaIdOrderByOrdenDesc(Long areaId);

    boolean existsByAreaIdAndNombreIgnoreCase(Long areaId, String nombre);

    long countByAreaId(Long areaId);
}
