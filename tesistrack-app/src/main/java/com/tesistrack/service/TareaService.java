package com.tesistrack.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.ForbiddenException;
import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.CrearTareaRequest;
import com.tesistrack.dto.TareaDto;
import com.tesistrack.model.Acuerdo;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.Tarea;
import com.tesistrack.model.User;
import com.tesistrack.repository.AcuerdoRepository;
import com.tesistrack.repository.TareaRepository;
import com.tesistrack.repository.UserRepository;

@Service
@Transactional
public class TareaService {

    private final TareaRepository tareaRepository;
    private final AcuerdoRepository acuerdoRepository;
    private final UserRepository userRepository;
    private final ProyectoService proyectoService;
    private final AccesoService acceso;

    public TareaService(
            TareaRepository tareaRepository,
            AcuerdoRepository acuerdoRepository,
            UserRepository userRepository,
            ProyectoService proyectoService,
            AccesoService acceso) {
        this.tareaRepository = tareaRepository;
        this.acuerdoRepository = acuerdoRepository;
        this.userRepository = userRepository;
        this.proyectoService = proyectoService;
        this.acceso = acceso;
    }

    public TareaDto crear(Long proyectoId, CrearTareaRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Proyecto proyecto = proyectoService.buscar(proyectoId);
        acceso.verificarAsesorDelProyecto(proyecto, usuario);

        Tarea tarea = new Tarea();
        tarea.setProyecto(proyecto);
        tarea.setDescripcion(request.descripcion());
        tarea.setFechaLimite(request.fechaLimite());

        if (request.acuerdoId() != null) {
            Acuerdo acuerdo = acuerdoRepository.findById(request.acuerdoId())
                .orElseThrow(() -> new NotFoundException("Acuerdo no encontrado"));
            if (!Objects.equals(acuerdo.getAsesoria().getProyecto().getId(), proyectoId)) {
                throw new IllegalArgumentException("El acuerdo pertenece a otro proyecto");
            }
            tarea.setAcuerdo(acuerdo);
        }

        if (request.responsableId() != null) {
            tarea.setResponsable(userRepository.findById(request.responsableId())
                .orElseThrow(() -> new NotFoundException("Responsable no encontrado")));
        }

        return TareaDto.from(tareaRepository.save(tarea));
    }

    @Transactional(readOnly = true)
    public List<TareaDto> listar(Long proyectoId, Boolean completada, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        acceso.verificarLectura(proyectoService.buscar(proyectoId), usuario);

        List<Tarea> tareas = completada == null
            ? tareaRepository.findByProyectoId(proyectoId)
            : tareaRepository.findByProyectoIdAndCompletada(proyectoId, completada);
        return tareas.stream().map(TareaDto::from).toList();
    }

    /** La completa el responsable de la tarea o el asesor del proyecto. */
    public TareaDto completar(Long tareaId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Tarea tarea = tareaRepository.findById(tareaId)
            .orElseThrow(() -> new NotFoundException("Tarea no encontrada"));

        boolean esResponsable = tarea.getResponsable() != null
            && Objects.equals(tarea.getResponsable().getId(), usuario.getId());
        if (!esResponsable && !acceso.esAsesorDe(tarea.getProyecto(), usuario)) {
            throw new ForbiddenException("Solo el responsable o el asesor pueden completar la tarea");
        }

        tarea.setCompletada(true);
        tarea.setCompletadaAt(Instant.now());
        return TareaDto.from(tarea);
    }
}
