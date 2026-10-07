package com.tesistrack.service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.dto.ReunionDto;
import com.tesistrack.model.Area;
import com.tesistrack.model.EstadoAsesoria;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.User;
import com.tesistrack.repository.AreaRepository;
import com.tesistrack.repository.AsesoriaRepository;
import com.tesistrack.repository.ProyectoRepository;
import com.tesistrack.repository.SesionEspacioRepository;

/**
 * Las próximas reuniones de un usuario, en una sola lista: las sesiones de su
 * espacio y las asesorías programadas de sus tesis. Es lo que muestran los dos
 * Dashboards, con el botón Unirse.
 *
 * <p>Qué le toca a cada rol sale de la misma regla de siempre, la pertenencia: el
 * estudiante ve lo de las tesis en las que figura y los espacios donde las tiene;
 * el asesor, lo de las tesis que asesora y los espacios que son suyos. El
 * coordinador no tiene reuniones propias.
 */
@Service
@Transactional(readOnly = true)
public class ReunionService {

    /**
     * Una reunión que empezó hace menos de esto se sigue mostrando: quien llega
     * tarde a una clase en curso todavía tiene que ver el botón para unirse.
     */
    static final Duration EN_CURSO = Duration.ofHours(1);

    static final int MAXIMO = 5;

    private final ProyectoRepository proyectoRepository;
    private final AreaRepository areaRepository;
    private final AsesoriaRepository asesoriaRepository;
    private final SesionEspacioRepository sesionRepository;
    private final AccesoService acceso;

    public ReunionService(
            ProyectoRepository proyectoRepository,
            AreaRepository areaRepository,
            AsesoriaRepository asesoriaRepository,
            SesionEspacioRepository sesionRepository,
            AccesoService acceso) {
        this.proyectoRepository = proyectoRepository;
        this.areaRepository = areaRepository;
        this.asesoriaRepository = asesoriaRepository;
        this.sesionRepository = sesionRepository;
        this.acceso = acceso;
    }

    public List<ReunionDto> proximas(Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Instant desde = Instant.now().minus(EN_CURSO);

        List<Proyecto> proyectos;
        List<Long> areaIds;
        switch (usuario.getRole()) {
            case ESTUDIANTE -> {
                proyectos = proyectoRepository.findByEstudiantesId(usuario.getId());
                areaIds = proyectos.stream()
                    .map(Proyecto::getArea)
                    .filter(Objects::nonNull)
                    .map(Area::getId)
                    .distinct()
                    .toList();
            }
            case ASESOR -> {
                proyectos = proyectoRepository.findByAsesorId(usuario.getId());
                areaIds = areaRepository.findByPropietarioIdOrderByNombreAsc(usuario.getId()).stream()
                    .map(Area::getId)
                    .toList();
            }
            default -> {
                return List.of();
            }
        }

        List<ReunionDto> reuniones = new ArrayList<>();
        if (!proyectos.isEmpty()) {
            List<Long> proyectoIds = proyectos.stream().map(Proyecto::getId).toList();
            asesoriaRepository
                .findByProyectoIdInAndEstadoAndFechaGreaterThanEqualOrderByFechaAsc(
                    proyectoIds, EstadoAsesoria.PROGRAMADA, desde)
                .forEach(a -> {
                    Area area = a.getProyecto().getArea();
                    reuniones.add(new ReunionDto(
                        ReunionDto.ASESORIA,
                        a.getId(),
                        a.getTema(),
                        a.getFecha(),
                        a.getEnlace(),
                        area == null ? null : area.getId(),
                        area == null ? null : area.getNombre(),
                        a.getProyecto().getId(),
                        a.getProyecto().getTitulo()));
                });
        }
        if (!areaIds.isEmpty()) {
            sesionRepository
                .findByAreaIdInAndFechaHoraGreaterThanEqualOrderByFechaHoraAsc(areaIds, desde)
                .forEach(s -> reuniones.add(new ReunionDto(
                    ReunionDto.SESION,
                    s.getId(),
                    s.getTitulo(),
                    s.getFechaHora(),
                    s.getEnlace(),
                    s.getArea().getId(),
                    s.getArea().getNombre(),
                    null,
                    null)));
        }

        return reuniones.stream()
            .sorted(Comparator.comparing(ReunionDto::fechaHora))
            .limit(MAXIMO)
            .toList();
    }
}
