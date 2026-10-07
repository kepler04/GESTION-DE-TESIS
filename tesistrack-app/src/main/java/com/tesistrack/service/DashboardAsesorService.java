package com.tesistrack.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.ForbiddenException;
import com.tesistrack.dto.DashboardAsesorDto;
import com.tesistrack.dto.DashboardAsesorDto.AtencionDto;
import com.tesistrack.dto.DashboardAsesorDto.ClaseDto;
import com.tesistrack.dto.DashboardAsesorDto.RevisionDto;
import com.tesistrack.dto.Semaforo;
import com.tesistrack.dto.SemaforoGrupo;
import com.tesistrack.model.Area;
import com.tesistrack.model.Entrega;
import com.tesistrack.model.EstadoEntrega;
import com.tesistrack.model.Hito;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.Role;
import com.tesistrack.model.User;
import com.tesistrack.repository.AreaRepository;
import com.tesistrack.repository.EntregaRepository;
import com.tesistrack.repository.HitoRepository;
import com.tesistrack.repository.ProyectoRepository;

/**
 * El Dashboard del profesor, agregado sobre todas sus clases.
 *
 * <p>La pertenencia es la de siempre y no se afloja: se parte de las clases de las
 * que el usuario es dueño y de las tesis donde es el asesor, y todo lo demás se
 * calcula a partir de eso. Con tres consultas (tesis, hitos y entregas) alcanza
 * para todo el panel: no hay una consulta por clase ni por grupo.
 */
@Service
@Transactional(readOnly = true)
public class DashboardAsesorService {

    private final AreaRepository areaRepository;
    private final ProyectoRepository proyectoRepository;
    private final HitoRepository hitoRepository;
    private final EntregaRepository entregaRepository;
    private final AccesoService acceso;

    public DashboardAsesorService(
            AreaRepository areaRepository,
            ProyectoRepository proyectoRepository,
            HitoRepository hitoRepository,
            EntregaRepository entregaRepository,
            AccesoService acceso) {
        this.areaRepository = areaRepository;
        this.proyectoRepository = proyectoRepository;
        this.hitoRepository = hitoRepository;
        this.entregaRepository = entregaRepository;
        this.acceso = acceso;
    }

    public DashboardAsesorDto resumen(Authentication authentication) {
        User asesor = acceso.usuarioActual(authentication);
        if (asesor.getRole() != Role.ASESOR) {
            throw new ForbiddenException("Este panel es solo para asesores");
        }
        LocalDate hoy = LocalDate.now();

        List<Area> areas = areaRepository.findByPropietarioIdOrderByNombreAsc(asesor.getId());
        List<Proyecto> proyectos = proyectoRepository.findByAsesorId(asesor.getId());
        Map<Long, List<Hito>> hitosPorProyecto = hitoRepository.findByProyectoAsesorId(asesor.getId()).stream()
            .collect(Collectors.groupingBy(h -> h.getProyecto().getId()));
        Map<Long, SemaforoGrupo> semaforos = proyectos.stream()
            .collect(Collectors.toMap(
                Proyecto::getId,
                p -> SemaforoGrupo.de(hitosPorProyecto.getOrDefault(p.getId(), List.of()), hoy)));

        return new DashboardAsesorDto(
            clases(areas, proyectos, semaforos),
            paraRevisar(asesor),
            necesitanAtencion(proyectos, hitosPorProyecto, semaforos, hoy));
    }

    private List<ClaseDto> clases(List<Area> areas, List<Proyecto> proyectos, Map<Long, SemaforoGrupo> semaforos) {
        return areas.stream().map(area -> {
            List<Proyecto> grupos = proyectos.stream()
                .filter(p -> p.getArea() != null && p.getArea().getId().equals(area.getId()))
                .toList();
            long alumnos = grupos.stream().mapToLong(p -> p.getEstudiantes().size()).sum();
            return new ClaseDto(
                area.getId(),
                area.getNombre(),
                alumnos,
                grupos.size(),
                contar(grupos, semaforos, SemaforoGrupo.VERDE),
                contar(grupos, semaforos, SemaforoGrupo.AMARILLO),
                contar(grupos, semaforos, SemaforoGrupo.ROJO),
                contar(grupos, semaforos, SemaforoGrupo.SIN_ACTIVIDAD));
        }).toList();
    }

    private static int contar(List<Proyecto> grupos, Map<Long, SemaforoGrupo> semaforos, SemaforoGrupo buscado) {
        return (int) grupos.stream().filter(p -> semaforos.get(p.getId()) == buscado).count();
    }

    /**
     * Las entregas que esperan al profesor, la más antigua primero: es la que lleva
     * más tiempo esperando. De cada hito cuenta solo la última versión, que es la
     * que de verdad hay que mirar; una versión vieja que quedó sin revisar porque
     * llegó otra encima no es trabajo pendiente.
     */
    private List<RevisionDto> paraRevisar(User asesor) {
        Map<Long, Entrega> ultimaPorHito = entregaRepository
            .findByEstadoAndHitoProyectoAsesorId(EstadoEntrega.EN_REVISION, asesor.getId()).stream()
            .collect(Collectors.toMap(
                e -> e.getHito().getId(),
                e -> e,
                (a, b) -> a.getVersion() >= b.getVersion() ? a : b));

        return ultimaPorHito.values().stream()
            .sorted(Comparator.comparing(Entrega::getCreatedAt))
            .map(e -> {
                Proyecto p = e.getHito().getProyecto();
                Area area = p.getArea();
                return new RevisionDto(
                    e.getId(),
                    e.getHito().getId(),
                    e.getHito().getNombre(),
                    e.getVersion(),
                    e.getCreatedAt(),
                    p.getId(),
                    PersonasService.tema(p),
                    nombres(p),
                    area == null ? null : area.getId(),
                    area == null ? null : area.getNombre());
            })
            .toList();
    }

    /** Los grupos atrasados y los que siguen sin tema; primero los atrasados. */
    private List<AtencionDto> necesitanAtencion(
            List<Proyecto> proyectos,
            Map<Long, List<Hito>> hitosPorProyecto,
            Map<Long, SemaforoGrupo> semaforos,
            LocalDate hoy) {
        List<AtencionDto> lista = new ArrayList<>();
        for (Proyecto p : proyectos) {
            SemaforoGrupo semaforo = semaforos.get(p.getId());
            boolean sinTema = PersonasService.tema(p) == null;
            if (semaforo != SemaforoGrupo.ROJO && !sinTema) {
                continue;
            }
            int enFalta = (int) hitosPorProyecto.getOrDefault(p.getId(), List.of()).stream()
                .filter(h -> Semaforo.de(h, hoy) == Semaforo.EN_FALTA)
                .count();
            Area area = p.getArea();
            lista.add(new AtencionDto(
                p.getId(),
                PersonasService.tema(p),
                nombres(p),
                area == null ? null : area.getId(),
                area == null ? null : area.getNombre(),
                semaforo,
                enFalta,
                sinTema));
        }
        return lista.stream()
            .sorted(Comparator
                .comparing((AtencionDto a) -> a.semaforo() != SemaforoGrupo.ROJO)
                .thenComparing(a -> a.alumnos().isEmpty() ? "" : a.alumnos().get(0), String.CASE_INSENSITIVE_ORDER))
            .toList();
    }

    private static List<String> nombres(Proyecto proyecto) {
        return proyecto.getEstudiantesOrdenados().stream().map(User::getName).toList();
    }
}
