package com.tesistrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.Aviso;

public interface AvisoRepository extends JpaRepository<Aviso, Long> {

    /** Los avisos de una clase, el más nuevo primero. */
    List<Aviso> findByAreaIdOrderByCreatedAtDesc(Long areaId);

    long countByAreaId(Long areaId);
}
