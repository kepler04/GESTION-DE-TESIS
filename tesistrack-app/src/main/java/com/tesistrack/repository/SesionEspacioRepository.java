package com.tesistrack.repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.SesionEspacio;

public interface SesionEspacioRepository extends JpaRepository<SesionEspacio, Long> {

    List<SesionEspacio> findByAreaIdOrderByFechaHoraAsc(Long areaId);

    List<SesionEspacio> findByAreaIdInAndFechaHoraGreaterThanEqualOrderByFechaHoraAsc(
        Collection<Long> areaIds, Instant desde);

    long countByAreaId(Long areaId);
}
