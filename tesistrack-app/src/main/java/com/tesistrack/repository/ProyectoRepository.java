package com.tesistrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.Proyecto;

public interface ProyectoRepository extends JpaRepository<Proyecto, Long> {

    /** Proyectos donde el usuario figura entre los estudiantes (la tesis puede ser grupal). */
    List<Proyecto> findByEstudiantesId(Long estudianteId);

    List<Proyecto> findByAsesorId(Long asesorId);

    List<Proyecto> findByAreaId(Long areaId);

    /** Las tesis de un asesor que no están en ninguna clase: sus asesorías privadas. */
    List<Proyecto> findByAsesorIdAndAreaIsNull(Long asesorId);

    long countByAsesorIdAndAreaIsNull(Long asesorId);

    /** ¿Algún proyecto de ese espacio tiene a este estudiante? Es lo que lo hace miembro del espacio. */
    boolean existsByAreaIdAndEstudiantesId(Long areaId, Long estudianteId);
}
