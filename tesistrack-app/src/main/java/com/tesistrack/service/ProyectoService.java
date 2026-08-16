package com.tesistrack.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.ForbiddenException;
import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.AsignarAreaRequest;
import com.tesistrack.dto.AsignarAsesorRequest;
import com.tesistrack.dto.CrearProyectoRequest;
import com.tesistrack.dto.EmailRequest;
import com.tesistrack.dto.ProyectoDto;
import com.tesistrack.dto.UnirseRequest;
import com.tesistrack.model.Area;
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
    private final AreaService areaService;
    private final ActividadService actividadService;

    public ProyectoService(
            ProyectoRepository proyectoRepository,
            UserRepository userRepository,
            AccesoService acceso,
            AreaService areaService,
            ActividadService actividadService) {
        this.proyectoRepository = proyectoRepository;
        this.userRepository = userRepository;
        this.acceso = acceso;
        this.areaService = areaService;
        this.actividadService = actividadService;
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
        // Quien la crea es el primer integrante; después puede sumar compañeros.
        proyecto.agregarEstudiante(usuario);
        if (request.fechaInicio() != null) {
            proyecto.setFechaInicio(request.fechaInicio());
        }

        // El código manda sobre el selector: si el estudiante pegó uno, quiso
        // entrar al espacio de ese asesor, no al que hubiera quedado en la lista.
        if (tieneTexto(request.codigoInvitacion())) {
            sumarAlEspacio(proyecto, request.codigoInvitacion());
        } else if (request.asesorId() != null) {
            proyecto.setAsesor(buscarAsesor(request.asesorId()));
        }

        return ProyectoDto.from(proyectoRepository.save(proyecto));
    }

    /**
     * El estudiante suma su proyecto ya existente al espacio de un asesor con el
     * código que este le pasó.
     *
     * Es el equivalente a "unirse a una clase": reemplaza al asesor anterior si lo
     * había, igual que {@link #asignarAsesor}, que el estudiante ya podía usar.
     */
    public ProyectoDto unirseConCodigo(Long id, UnirseRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Proyecto proyecto = buscar(id);
        acceso.verificarEstudianteDelProyecto(proyecto, usuario);

        sumarAlEspacio(proyecto, request.codigo());
        return ProyectoDto.from(proyecto);
    }

    /**
     * Deja el proyecto con el asesor dueño del código y dentro de su área, y le
     * reparte las actividades que ese espacio ya tenía.
     *
     * <p>Es el único punto por donde se entra a un área —lo usan tanto {@link #crear}
     * con código como {@link #unirseConCodigo}—, así que el reparto va acá y no en
     * cada camino por separado. Sin esto, el que llega tarde entraría a un espacio
     * con actividades y no vería ninguna, y el asesor tendría que acordarse de
     * cargárselas a mano.
     */
    private void sumarAlEspacio(Proyecto proyecto, String codigo) {
        Area area = areaService.buscarPorCodigo(codigo);
        proyecto.setAsesor(area.getPropietario());
        proyecto.setArea(area);

        // El proyecto tiene que existir en la base antes de colgarle hitos.
        proyectoRepository.save(proyecto);
        actividadService.repartirPendientes(proyecto, area);
    }

    /**
     * Suma un compañero a una tesis grupal, buscándolo por su correo.
     *
     * <p>Lo hace un integrante del grupo, no el asesor: la tesis es de ellos. Se pide
     * el correo y no un id porque nadie sabe de memoria el id de otro usuario, y
     * listar todos los estudiantes de la plataforma para elegir sería exponer el
     * padrón entero.
     */
    public ProyectoDto agregarEstudiante(Long id, EmailRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Proyecto proyecto = buscar(id);
        acceso.verificarEstudianteDelProyecto(proyecto, usuario);

        User companero = userRepository.findByEmail(User.normalizarEmail(request.email()))
            .orElseThrow(() -> new NotFoundException("No hay ninguna cuenta con ese correo"));

        if (companero.getRole() != Role.ESTUDIANTE) {
            throw new IllegalArgumentException("Solo se puede sumar a alguien con rol estudiante");
        }
        if (proyecto.tieneEstudiante(companero.getId())) {
            throw new IllegalArgumentException("Esa persona ya está en la tesis");
        }

        proyecto.agregarEstudiante(companero);
        return ProyectoDto.from(proyecto);
    }

    /** Cualquiera del grupo puede sacar a otro —o irse—, menos dejarla sin nadie. */
    public ProyectoDto quitarEstudiante(Long id, Long estudianteId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Proyecto proyecto = buscar(id);
        acceso.verificarEstudianteDelProyecto(proyecto, usuario);

        if (!proyecto.tieneEstudiante(estudianteId)) {
            throw new NotFoundException("Esa persona no está en la tesis");
        }

        proyecto.quitarEstudiante(
            userRepository.findById(estudianteId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado")));
        return ProyectoDto.from(proyecto);
    }

    private static boolean tieneTexto(String valor) {
        return valor != null && !valor.isBlank();
    }

    /**
     * Estudiante: los suyos. Asesor: los asignados. Coordinador: todos (solo lectura).
     */
    @Transactional(readOnly = true)
    public List<ProyectoDto> listar(Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        List<Proyecto> proyectos = switch (usuario.getRole()) {
            case ESTUDIANTE -> proyectoRepository.findByEstudiantesId(usuario.getId());
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

        User nuevoAsesor = buscarAsesor(request.asesorId());
        // El área es una etiqueta del asesor anterior: con otro asesor ya no
        // significa nada, y dejarla apuntaría a un área que el nuevo no puede ver.
        if (proyecto.getAsesor() == null || !proyecto.getAsesor().getId().equals(nuevoAsesor.getId())) {
            proyecto.setArea(null);
        }
        proyecto.setAsesor(nuevoAsesor);
        return ProyectoDto.from(proyecto);
    }

    /**
     * El asesor etiqueta el proyecto con una de sus áreas, o le saca la etiqueta
     * mandando {@code areaId} en null.
     */
    public ProyectoDto asignarArea(Long id, AsignarAreaRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Proyecto proyecto = buscar(id);
        acceso.verificarAsesorDelProyecto(proyecto, usuario);

        // resolverPropia falla si el área es de otro asesor.
        proyecto.setArea(areaService.resolverPropia(request.areaId(), usuario));
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
