package com.tesistrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.Asesoria;

public interface AsesoriaRepository extends JpaRepository<Asesoria, Long> {

    List<Asesoria> findByProyectoIdOrderByFechaDesc(Long proyectoId);
}
