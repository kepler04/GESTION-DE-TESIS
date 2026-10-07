package com.tesistrack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tesistrack.model.ArchivoMaterial;

public interface ArchivoMaterialRepository extends JpaRepository<ArchivoMaterial, Long> {

    Optional<ArchivoMaterial> findByMaterialId(Long materialId);

    /*
     * Los borrados van como consulta directa y no como entidades: un deleteBy...
     * derivado cargaría cada archivo (hasta 15 MB) en memoria solo para borrarlo.
     */

    @Modifying(flushAutomatically = true)
    @Query("delete from ArchivoMaterial a where a.material.id = :materialId")
    void borrarDeMaterial(@Param("materialId") Long materialId);

    @Modifying(flushAutomatically = true)
    @Query(value = "delete from archivo_material where material_id in "
        + "(select id from material where carpeta_id = :carpetaId)", nativeQuery = true)
    void borrarDeCarpeta(@Param("carpetaId") Long carpetaId);

    @Modifying(flushAutomatically = true)
    @Query(value = "delete from archivo_material where material_id in "
        + "(select m.id from material m join carpeta_material c on c.id = m.carpeta_id "
        + "where c.area_id = :areaId)", nativeQuery = true)
    void borrarDeArea(@Param("areaId") Long areaId);
}
