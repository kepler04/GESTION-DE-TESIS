package com.tesistrack.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.dto.PersonasDto;
import com.tesistrack.dto.PersonasDto.AlumnoDto;
import com.tesistrack.dto.PersonasDto.GrupoDto;
import com.tesistrack.dto.SemaforoGrupo;
import com.tesistrack.dto.UserDto;
import com.tesistrack.model.Area;
import com.tesistrack.model.Hito;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.Role;
import com.tesistrack.model.User;
import com.tesistrack.repository.HitoRepository;
import com.tesistrack.repository.ProyectoRepository;

/**
 * La pestaña Personas de una clase: el profesor y los alumnos agrupados por grupo.
 *
 * <p>Una clase es de un solo profesor y sus grupos son las tesis que se sumaron con
 * su código. Cada grupo aparece **una vez**, con sus integrantes juntos, aunque sea
 * de una sola persona: entregan una sola vez y su avance es uno solo.
 *
 * <p>Qué se muestra depende de quién mira: ver {@link PersonasDto}. La regla de
 * fondo es que un estudiante ve a sus compañeros por el nombre y nada más.
 */
@Service
@Transactional(readOnly = true)
public class PersonasService {

    private final ProyectoRepository proyectoRepository;
    private final HitoRepository hitoRepository;
    private final AreaService areaService;
    private final AccesoService acceso;

    public PersonasService(
            ProyectoRepository proyectoRepository,
            HitoRepository hitoRepository,
            AreaService areaService,
            AccesoService acceso) {
        this.proyectoRepository = proyectoRepository;
        this.hitoRepository = hitoRepository;
        this.areaService = areaService;
        this.acceso = acceso;
    }

    public PersonasDto personas(Long areaId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Area area = areaService.buscarComoMiembro(areaId, usuario);
        // El coordinador lee todo (Decisión 8), igual que el dueño de la clase.
        boolean detalle = areaService.esPropietario(area, usuario) || usuario.getRole() == Role.COORDINADOR;
        LocalDate hoy = LocalDate.now();

        // El semáforo solo lo ve el profesor: se calcula solo si hace falta.
        Map<Long, List<Hito>> hitos = detalle
            ? hitoRepository.findByProyectoAreaId(areaId).stream()
                .collect(Collectors.groupingBy(h -> h.getProyecto().getId()))
            : Map.of();

        List<GrupoDto> grupos = proyectoRepository.findByAreaId(areaId).stream()
            .map(p -> armar(p, usuario, detalle, hitos.getOrDefault(p.getId(), List.of()), hoy))
            // El propio grupo primero (si es un estudiante), después por nombre.
            .sorted(Comparator
                .comparing(GrupoDto::propio).reversed()
                .thenComparing(g -> g.alumnos().isEmpty() ? "" : g.alumnos().get(0).nombre(),
                    String.CASE_INSENSITIVE_ORDER))
            .toList();

        return new PersonasDto(UserDto.from(area.getPropietario()), grupos, detalle);
    }

    private GrupoDto armar(Proyecto proyecto, User usuario, boolean detalle, List<Hito> hitos, LocalDate hoy) {
        boolean propio = acceso.esEstudianteDe(proyecto, usuario);
        boolean verTodo = detalle || propio;

        List<AlumnoDto> alumnos = proyecto.getEstudiantesOrdenados().stream()
            .map(e -> new AlumnoDto(e.getId(), e.getName(), verTodo ? e.getEmail() : null))
            .toList();

        return new GrupoDto(
            verTodo ? proyecto.getId() : null,
            verTodo ? tema(proyecto) : null,
            detalle ? SemaforoGrupo.de(hitos, hoy) : null,
            verTodo ? proyecto.getAreaDesde() : null,
            propio,
            alumnos);
    }

    /** El título de la tesis, o {@code null} si todavía no tiene tema. */
    static String tema(Proyecto proyecto) {
        String titulo = proyecto.getTitulo();
        return titulo == null || titulo.isBlank() ? null : titulo;
    }
}
