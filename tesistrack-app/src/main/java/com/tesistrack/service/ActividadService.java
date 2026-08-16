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

import com.tesistrack.config.ForbiddenException;
import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.ActividadDto;
import com.tesistrack.dto.ActividadRequest;
import com.tesistrack.dto.AreaDto;
import com.tesistrack.dto.Semaforo;
import com.tesistrack.dto.TableroDto;
import com.tesistrack.dto.UserDto;
import com.tesistrack.model.Actividad;
import com.tesistrack.model.Area;
import com.tesistrack.model.Hito;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.Role;
import com.tesistrack.model.User;
import com.tesistrack.repository.ActividadRepository;
import com.tesistrack.repository.EntregaRepository;
import com.tesistrack.repository.HitoRepository;
import com.tesistrack.repository.ProyectoRepository;

/**
 * Actividades de un área: la consigna que el asesor deja a todos sus asesorados
 * de una vez.
 *
 * <p>El reparto crea un {@link Hito} por proyecto del área. Nada más: la entrega,
 * la observación y el ciclo de corrección siguen colgando del hito como siempre.
 */
@Service
@Transactional
public class ActividadService {

    private final ActividadRepository actividadRepository;
    private final HitoRepository hitoRepository;
    private final ProyectoRepository proyectoRepository;
    private final EntregaRepository entregaRepository;
    private final AreaService areaService;
    private final AccesoService acceso;

    public ActividadService(
            ActividadRepository actividadRepository,
            HitoRepository hitoRepository,
            ProyectoRepository proyectoRepository,
            EntregaRepository entregaRepository,
            AreaService areaService,
            AccesoService acceso) {
        this.actividadRepository = actividadRepository;
        this.hitoRepository = hitoRepository;
        this.proyectoRepository = proyectoRepository;
        this.entregaRepository = entregaRepository;
        this.areaService = areaService;
        this.acceso = acceso;
    }

    public ActividadDto crear(Long areaId, ActividadRequest request, Authentication authentication) {
        Area area = areaPropia(areaId, authentication);

        if (actividadRepository.existsByAreaIdAndNombreIgnoreCase(areaId, request.nombre())) {
            throw new IllegalArgumentException("Ya dejaste una actividad con ese nombre en este espacio");
        }

        Actividad actividad = new Actividad();
        actividad.setArea(area);
        actividad.setNombre(request.nombre());
        actividad.setDescripcion(request.descripcion());
        actividad.setFechaLimite(request.fechaLimite());
        actividad.setOrden(request.orden() == null ? siguienteOrden(areaId) : request.orden());
        actividadRepository.save(actividad);

        repartir(actividad, proyectoRepository.findByAreaId(areaId));
        return ActividadDto.from(actividad);
    }

    @Transactional(readOnly = true)
    public List<ActividadDto> listar(Long areaId, Authentication authentication) {
        areaPropia(areaId, authentication);
        return actividadRepository.findByAreaIdOrderByOrdenAsc(areaId).stream()
            .map(ActividadDto::from)
            .toList();
    }

    /**
     * Saca la actividad del espacio.
     *
     * <p>Los hitos que ya tienen entregas <b>no se borran</b>: se desenganchan y
     * quedan como hitos comunes del proyecto. Borrarlos se llevaría el historial de
     * versiones y observaciones, que es justo lo que la Decisión 4 protege. Los que
     * nadie tocó sí se borran, para no dejarle basura al estudiante.
     */
    public void eliminar(Long areaId, Long actividadId, Authentication authentication) {
        areaPropia(areaId, authentication);
        Actividad actividad = buscarEnArea(actividadId, areaId);

        for (Hito hito : hitoRepository.findByActividadId(actividadId)) {
            if (entregaRepository.existsByHitoId(hito.getId())) {
                hito.setActividad(null);
            } else {
                hitoRepository.delete(hito);
            }
        }
        actividadRepository.delete(actividad);
    }

    /**
     * Le reparte a un proyecto recién llegado todas las actividades vigentes del
     * área. Lo llama {@link ProyectoService} al sumar a alguien con el código.
     */
    public void repartirPendientes(Proyecto proyecto, Area area) {
        for (Actividad actividad : actividadRepository.findByAreaIdOrderByOrdenAsc(area.getId())) {
            crearHito(actividad, proyecto);
        }
    }

    private void repartir(Actividad actividad, List<Proyecto> proyectos) {
        proyectos.forEach(p -> crearHito(actividad, p));
    }

    /**
     * Crea el hito del estudiante para esa actividad, si todavía no lo tiene.
     *
     * <p>La guarda importa: alguien puede salir de un espacio y volver a entrar con
     * el mismo código, y sin esto terminaría con "Actividad 1" dos veces.
     */
    private void crearHito(Actividad actividad, Proyecto proyecto) {
        if (hitoRepository.existsByProyectoIdAndActividadId(proyecto.getId(), actividad.getId())) {
            return;
        }
        Hito hito = new Hito();
        hito.setProyecto(proyecto);
        hito.setActividad(actividad);
        hito.setNombre(actividad.getNombre());
        hito.setDescripcion(actividad.getDescripcion());
        hito.setFechaLimite(actividad.getFechaLimite());
        hito.setOrden(actividad.getOrden());
        hitoRepository.save(hito);
    }

    /**
     * Grilla del espacio: estudiantes × actividades.
     *
     * <p>Se arma con dos consultas —los proyectos del área y todos sus hitos— y se
     * cruza en memoria. Con una consulta por celda, veinte asesorados por seis
     * actividades serían ciento veinte viajes a la base.
     */
    @Transactional(readOnly = true)
    public TableroDto tablero(Long areaId, Authentication authentication) {
        Area area = areaPropia(areaId, authentication);
        LocalDate hoy = LocalDate.now();

        List<Actividad> actividades = actividadRepository.findByAreaIdOrderByOrdenAsc(areaId);

        // Hitos repartidos del área, indexados por proyecto y actividad.
        Map<Long, Map<Long, Hito>> porProyecto = hitoRepository.findByProyectoAreaId(areaId).stream()
            .filter(h -> h.getActividad() != null)
            .collect(Collectors.groupingBy(
                h -> h.getProyecto().getId(),
                Collectors.toMap(h -> h.getActividad().getId(), Function.identity(), (a, b) -> a)));

        List<TableroDto.FilaDto> filas = proyectoRepository.findByAreaId(areaId).stream()
            .map(p -> armarFila(p, actividades, porProyecto.getOrDefault(p.getId(), Map.of()), hoy))
            // Primero quien está en falta, después quien espera revisión.
            .sorted(Comparator
                .comparingInt(TableroDto.FilaDto::enFalta).reversed()
                .thenComparing(Comparator.comparingInt(TableroDto.FilaDto::porRevisar).reversed())
                .thenComparing(f -> f.titulo() == null ? "" : f.titulo()))
            .toList();

        return new TableroDto(AreaDto.from(area), actividades.stream().map(ActividadDto::from).toList(), filas);
    }

    private TableroDto.FilaDto armarFila(
            Proyecto proyecto, List<Actividad> actividades, Map<Long, Hito> hitos, LocalDate hoy) {

        List<TableroDto.CeldaDto> celdas = actividades.stream()
            .map(a -> {
                Hito hito = hitos.get(a.getId());
                return new TableroDto.CeldaDto(
                    a.getId(),
                    hito == null ? null : hito.getId(),
                    hito == null ? null : hito.getEstado(),
                    Semaforo.de(hito, hoy));
            })
            .toList();

        int enFalta = (int) celdas.stream().filter(c -> c.semaforo() == Semaforo.EN_FALTA).count();
        int porRevisar = (int) celdas.stream().filter(c -> c.semaforo() == Semaforo.POR_REVISAR).count();

        return new TableroDto.FilaDto(
            proyecto.getEstudiantesOrdenados().stream().map(UserDto::from).toList(),
            proyecto.getId(),
            proyecto.getTitulo(),
            celdas,
            enFalta,
            porRevisar);
    }

    private int siguienteOrden(Long areaId) {
        return actividadRepository.findByAreaIdOrderByOrdenAsc(areaId).stream()
            .mapToInt(Actividad::getOrden)
            .max()
            .orElse(0) + 1;
    }

    private Actividad buscarEnArea(Long actividadId, Long areaId) {
        Actividad actividad = actividadRepository.findById(actividadId)
            .orElseThrow(() -> new NotFoundException("Actividad no encontrada"));
        if (!actividad.getArea().getId().equals(areaId)) {
            throw new NotFoundException("Actividad no encontrada");
        }
        return actividad;
    }

    private Area areaPropia(Long areaId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        if (usuario.getRole() != Role.ASESOR) {
            throw new ForbiddenException("Solo un asesor gestiona las actividades de un espacio");
        }
        return areaService.buscarPropia(areaId, usuario);
    }
}
