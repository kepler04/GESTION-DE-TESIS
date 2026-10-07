package com.tesistrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.Material;

public interface MaterialRepository extends JpaRepository<Material, Long> {

    /** Todos los materiales de un espacio, para armar las carpetas con dos consultas y no N+1. */
    List<Material> findByCarpetaAreaIdOrderByCreatedAtAscIdAsc(Long areaId);

    List<Material> findByCarpetaId(Long carpetaId);

    long countByCarpetaId(Long carpetaId);

    long countByCarpetaAreaId(Long areaId);

    long countByCarpetaAreaIdAndArchivoNombreIsNotNull(Long areaId);
}
