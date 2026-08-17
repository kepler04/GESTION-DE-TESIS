package com.tesistrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.Acuerdo;

public interface AcuerdoRepository extends JpaRepository<Acuerdo, Long> {

    List<Acuerdo> findByAsesoriaId(Long asesoriaId);

    /** Todos los acuerdos de un proyecto, para poder borrarlo entero. */
    List<Acuerdo> findByAsesoriaProyectoId(Long proyectoId);
}
