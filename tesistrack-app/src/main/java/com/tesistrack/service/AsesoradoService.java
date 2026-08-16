package com.tesistrack.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.ForbiddenException;
import com.tesistrack.dto.AreaDto;
import com.tesistrack.dto.AsesoradoDto;
import com.tesistrack.dto.HitoDto;
import com.tesistrack.dto.UserDto;
import com.tesistrack.model.EstadoHito;
import com.tesistrack.model.EstadoObservacion;
import com.tesistrack.model.Hito;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.Role;
import com.tesistrack.model.User;
import com.tesistrack.repository.HitoRepository;
import com.tesistrack.repository.ObservacionRepository;
import com.tesistrack.repository.ProyectoRepository;
import com.tesistrack.repository.TareaRepository;

/**
 * Panel del asesor: sus asesorados y qué necesita atención de cada uno.
 *
 * Es una vista de lectura sobre lo que ya existe — no agrega entidades ni cambia
 * permisos. Solo lista proyectos donde el usuario ya es el asesor asignado.
 */
@Service
@Transactional(readOnly = true)
public class AsesoradoService {

    private final ProyectoRepository proyectoRepository;
    private final HitoRepository hitoRepository;
    private final ObservacionRepository observacionRepository;
    private final TareaRepository tareaRepository;
    private final AccesoService acceso;

    public AsesoradoService(
            ProyectoRepository proyectoRepository,
            HitoRepository hitoRepository,
            ObservacionRepository observacionRepository,
            TareaRepository tareaRepository,
            AccesoService acceso) {
        this.proyectoRepository = proyectoRepository;
        this.hitoRepository = hitoRepository;
        this.observacionRepository = observacionRepository;
        this.tareaRepository = tareaRepository;
        this.acceso = acceso;
    }

    public List<AsesoradoDto> listar(Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        if (usuario.getRole() != Role.ASESOR) {
            throw new ForbiddenException("Solo un asesor tiene asesorados");
        }

        LocalDate hoy = LocalDate.now();

        return proyectoRepository.findByAsesorId(usuario.getId()).stream()
            .map(p -> armar(p, hoy))
            // Primero lo que necesita atención, y dentro de eso lo más cargado.
            .sorted(
                Comparator.comparing(AsesoradoDto::alDia)
                    .thenComparing(Comparator.comparingInt(AsesoradoService::pendientes).reversed())
                    .thenComparing(AsesoradoDto::titulo))
            .toList();
    }

    private AsesoradoDto armar(Proyecto proyecto, LocalDate hoy) {
        List<Hito> hitos = hitoRepository.findByProyectoIdOrderByOrdenAsc(proyecto.getId());

        Hito actual = hitos.stream()
            .filter(h -> h.getEstado() != EstadoHito.COMPLETADO)
            .findFirst()
            .orElse(null);

        int completados = (int) hitos.stream()
            .filter(h -> h.getEstado() == EstadoHito.COMPLETADO)
            .count();

        // Un hito ENTREGADO es una versión esperando que el asesor la mire.
        int porRevisar = (int) hitos.stream()
            .filter(h -> h.getEstado() == EstadoHito.ENTREGADO)
            .count();

        int observaciones = observacionRepository
            .findByEntregaHitoProyectoIdAndEstado(proyecto.getId(), EstadoObservacion.PENDIENTE)
            .size();

        int vencidas = (int) tareaRepository
            .findByProyectoIdAndCompletada(proyecto.getId(), false).stream()
            .filter(t -> t.getFechaLimite() != null && t.getFechaLimite().isBefore(hoy))
            .count();

        return new AsesoradoDto(
            proyecto.getEstudiantesOrdenados().stream().map(UserDto::from).toList(),
            proyecto.getId(),
            proyecto.getTitulo(),
            AreaDto.sinCodigo(proyecto.getArea()),
            actual == null ? null : HitoDto.from(actual),
            completados,
            hitos.size(),
            porRevisar,
            observaciones,
            vencidas);
    }

    private static int pendientes(AsesoradoDto a) {
        return a.entregasPorRevisar() + a.observacionesPendientes() + a.tareasVencidas();
    }
}
