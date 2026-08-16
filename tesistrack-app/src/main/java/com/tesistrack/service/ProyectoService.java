package com.tesistrack.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.ForbiddenException;
import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.AsignarAsesorRequest;
import com.tesistrack.dto.CrearProyectoRequest;
import com.tesistrack.dto.ProyectoDto;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.Role;
import com.tesistrack.model.User;
import com.tesistrack.repository.ProyectoRepository;
import com.tesistrack.repository.UserRepository;

@Service
@Transactional
public class ProyectoService {

    private final ProyectoRepository proyectoRepository;
    private final UserRepository userRepository;
    private final AccesoService acceso;

    public ProyectoService(
            ProyectoRepository proyectoRepository,
            UserRepository userRepository,
            AccesoService acceso) {
        this.proyectoRepository = proyectoRepository;
        this.userRepository = userRepository;
        this.acceso = acceso;
    }

    /** Solo el estudiante crea su proyecto (ver Flujo del sistema). */
    public ProyectoDto crear(CrearProyectoRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        if (usuario.getRole() != Role.ESTUDIANTE) {
            throw new ForbiddenException("Solo un estudiante puede crear un proyecto");
        }

        Proyecto proyecto = new Proyecto();
        proyecto.setTitulo(request.titulo());
        proyecto.setDescripcion(request.descripcion());
        proyecto.setEstudiante(usuario);
        if (request.asesorId() != null) {
            proyecto.setAsesor(buscarAsesor(request.asesorId()));
        }

        return ProyectoDto.from(proyectoRepository.save(proyecto));
    }

    /**
     * Estudiante: los suyos. Asesor: los asignados. Coordinador: todos (solo lectura).
     */
    @Transactional(readOnly = true)
    public List<ProyectoDto> listar(Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        List<Proyecto> proyectos = switch (usuario.getRole()) {
            case ESTUDIANTE -> proyectoRepository.findByEstudianteId(usuario.getId());
            case ASESOR -> proyectoRepository.findByAsesorId(usuario.getId());
            case COORDINADOR -> proyectoRepository.findAll();
        };
        return proyectos.stream().map(ProyectoDto::from).toList();
    }

    @Transactional(readOnly = true)
    public ProyectoDto obtener(Long id, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Proyecto proyecto = buscar(id);
        acceso.verificarLectura(proyecto, usuario);
        return ProyectoDto.from(proyecto);
    }

    /** El estudiante elige o cambia el asesor de su propio proyecto. */
    public ProyectoDto asignarAsesor(Long id, AsignarAsesorRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Proyecto proyecto = buscar(id);
        acceso.verificarEstudianteDelProyecto(proyecto, usuario);

        proyecto.setAsesor(buscarAsesor(request.asesorId()));
        return ProyectoDto.from(proyecto);
    }

    /** Usado por los demás servicios; ya deja el proyecto cargado en la transacción. */
    Proyecto buscar(Long id) {
        return proyectoRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Proyecto no encontrado"));
    }

    private User buscarAsesor(Long asesorId) {
        User asesor = userRepository.findById(asesorId)
            .orElseThrow(() -> new NotFoundException("Asesor no encontrado"));
        if (asesor.getRole() != Role.ASESOR) {
            throw new IllegalArgumentException("El usuario indicado no es un asesor");
        }
        return asesor;
    }
}
