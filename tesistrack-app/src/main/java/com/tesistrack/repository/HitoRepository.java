package com.tesistrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.Hito;

public interface HitoRepository extends JpaRepository<Hito, Long> {

    List<Hito> findByProyectoIdOrderByOrdenAsc(Long proyectoId);
}
