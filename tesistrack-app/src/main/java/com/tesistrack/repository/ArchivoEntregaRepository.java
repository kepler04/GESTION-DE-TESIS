package com.tesistrack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.ArchivoEntrega;

public interface ArchivoEntregaRepository extends JpaRepository<ArchivoEntrega, Long> {

    Optional<ArchivoEntrega> findByEntregaId(Long entregaId);

    void deleteByEntregaId(Long entregaId);
}
