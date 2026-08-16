package com.tesistrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.Proyecto;

public interface ProyectoRepository extends JpaRepository<Proyecto, Long> {

    List<Proyecto> findByEstudianteId(Long estudianteId);

    List<Proyecto> findByAsesorId(Long asesorId);

    List<Proyecto> findByAreaId(Long areaId);
}
