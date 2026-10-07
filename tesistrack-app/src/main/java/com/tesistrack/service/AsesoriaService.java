package com.tesistrack.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.ForbiddenException;
import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.AcuerdoDto;
import com.tesistrack.dto.ActualizarAsesoriaRequest;
import com.tesistrack.dto.AsesoriaDto;
import com.tesistrack.dto.CambiarEstadoAsesoriaRequest;
import com.tesistrack.dto.CrearAcuerdoRequest;
import com.tesistrack.dto.CrearAsesoriaRequest;
import com.tesistrack.model.Acuerdo;
import com.tesistrack.model.Asesoria;
import com.tesistrack.model.EstadoAsesoria;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.Role;
import com.tesistrack.model.User;
import com.tesistrack.repository.AcuerdoRepository;
import com.tesistrack.repository.AsesoriaRepository;

/**
 * Cadena asesoría → acuerdo. Las tareas que derivan de un acuerdo las maneja
 * {@link TareaService}.
 *
 * <p>Una asesoría puede registrarse cuando ya ocurrió ({@code REALIZADA}) o
 * programarse antes ({@code PROGRAMADA}, con fecha y enlace) y después marcarse
 * como realizada o cancelada. Solo una asesoría realizada admite acuerdos.
 */
@Service
@Transactional
public class AsesoriaService {

    private final AsesoriaRepository asesoriaRepository;
    private final AcuerdoRepository acuerdoRepository;
    private final ProyectoService proyectoService;
    private final AccesoService acceso;

    public AsesoriaService(
            AsesoriaRepository asesoriaRepository,
            AcuerdoRepository acuerdoRepository,
            ProyectoService proyectoService,
            AccesoService acceso) {
        this.asesoriaRepository = asesoriaRepository;
        this.acuerdoRepository = acuerdoRepository;
        this.proyectoService = proyectoService;
        this.acceso = acceso;
    }

    /**
     * Abre una asesoría. La puede abrir <b>cualquiera de los dos</b>: el asesor para
     * dejar constancia de una reunión o agendarla, el estudiante para plantear una
     * consulta, pedir una revisión o proponer una reunión (Decisión 13).
     *
     * <p>La asimetría con {@link #crearAcuerdo} es deliberada: se abre la puerta de
     * entrada, no la de salida. Solo el asesor decide qué de la conversación se
     * convierte en un acuerdo, y de ahí en tarea.
     *
     * <p>Sin {@code estado} se registra como {@code REALIZADA}, que es lo que
     * hacía siempre; agendar es optar por {@code PROGRAMADA}.
     */
    public AsesoriaDto crear(Long proyectoId, CrearAsesoriaRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Proyecto proyecto = proyectoService.buscar(proyectoId);
        // Lectura, no "asesor del proyecto": verificarLectura le niega el paso al
        // coordinador igual, que sigue sin escribir nada (Decisión 8).
        acceso.verificarLectura(proyecto, usuario);
        if (usuario.getRole() == Role.COORDINADOR) {
            throw new ForbiddenException("El coordinador consulta, no registra asesorías");
        }

        EstadoAsesoria estado = request.estado() == null ? EstadoAsesoria.REALIZADA : request.estado();
        if (estado == EstadoAsesoria.CANCELADA) {
            throw new IllegalArgumentException("Una asesoría no puede nacer cancelada");
        }

        Asesoria asesoria = new Asesoria();
        asesoria.setProyecto(proyecto);
        asesoria.setFecha(request.fecha());
        asesoria.setTema(request.tema());
        asesoria.setResumen(request.resumen());
        asesoria.setEstado(estado);
        asesoria.setEnlace(Enlaces.https(request.enlace()));
        asesoria.setRegistradaPor(usuario);
        return AsesoriaDto.from(asesoriaRepository.save(asesoria));
    }

    @Transactional(readOnly = true)
    public List<AsesoriaDto> listar(Long proyectoId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        acceso.verificarLectura(proyectoService.buscar(proyectoId), usuario);
        return asesoriaRepository.findByProyectoIdOrderByFechaDesc(proyectoId).stream()
            .map(AsesoriaDto::from)
            .toList();
    }

    /**
     * Reprograma una asesoría que todavía está programada: otra fecha, otro tema u
     * otro enlace. Lo puede hacer el asesor o quien la programó; una vez realizada
     * o cancelada ya es historia y no se toca.
     */
    public AsesoriaDto actualizar(Long id, ActualizarAsesoriaRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Asesoria asesoria = buscar(id);
        verificarProgramada(asesoria);
        verificarAsesorOAutor(asesoria, usuario);

        asesoria.setFecha(request.fecha());
        asesoria.setTema(request.tema());
        asesoria.setEnlace(Enlaces.https(request.enlace()));
        return AsesoriaDto.from(asesoria);
    }

    /**
     * {@code PROGRAMADA → REALIZADA | CANCELADA}.
     *
     * <p>Marcarla realizada es del <b>asesor</b>: es quien completa el resumen y
     * después los acuerdos, igual que en la Decisión 13 (el estudiante plantea, el
     * asesor resuelve). Cancelarla puede el asesor o quien la programó, para que un
     * estudiante pueda deshacer una reunión que propuso por error.
     */
    public AsesoriaDto cambiarEstado(Long id, CambiarEstadoAsesoriaRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Asesoria asesoria = buscar(id);
        verificarProgramada(asesoria);

        switch (request.estado()) {
            case REALIZADA -> {
                acceso.verificarAsesorDelProyecto(asesoria.getProyecto(), usuario);
                asesoria.setEstado(EstadoAsesoria.REALIZADA);
                if (request.resumen() != null && !request.resumen().isBlank()) {
                    asesoria.setResumen(request.resumen().trim());
                }
            }
            case CANCELADA -> {
                verificarAsesorOAutor(asesoria, usuario);
                asesoria.setEstado(EstadoAsesoria.CANCELADA);
            }
            default -> throw new IllegalArgumentException("La asesoría ya está programada");
        }
        return AsesoriaDto.from(asesoria);
    }

    /** Solo de una reunión realizada: no se puede acordar nada en una que no se hizo. */
    public AcuerdoDto crearAcuerdo(Long asesoriaId, CrearAcuerdoRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Asesoria asesoria = buscar(asesoriaId);
        acceso.verificarAsesorDelProyecto(asesoria.getProyecto(), usuario);
        if (asesoria.getEstado() != EstadoAsesoria.REALIZADA) {
            throw new IllegalArgumentException(
                "Solo se pueden registrar acuerdos de una reunión realizada: marcala como realizada primero");
        }

        Acuerdo acuerdo = new Acuerdo();
        acuerdo.setAsesoria(asesoria);
        acuerdo.setDescripcion(request.descripcion());
        return AcuerdoDto.from(acuerdoRepository.save(acuerdo));
    }

    @Transactional(readOnly = true)
    public List<AcuerdoDto> listarAcuerdos(Long asesoriaId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Asesoria asesoria = buscar(asesoriaId);
        acceso.verificarLectura(asesoria.getProyecto(), usuario);
        return acuerdoRepository.findByAsesoriaId(asesoriaId).stream()
            .map(AcuerdoDto::from)
            .toList();
    }

    private void verificarProgramada(Asesoria asesoria) {
        if (asesoria.getEstado() != EstadoAsesoria.PROGRAMADA) {
            throw new IllegalArgumentException("Solo se puede cambiar una asesoría que está programada");
        }
    }

    /**
     * El asesor del proyecto, o el estudiante que la abrió mientras siga siendo
     * parte de la tesis. Un coordinador, un asesor ajeno o un compañero que no la
     * abrió quedan afuera.
     */
    private void verificarAsesorOAutor(Asesoria asesoria, User usuario) {
        Proyecto proyecto = asesoria.getProyecto();
        boolean esAsesor = acceso.esAsesorDe(proyecto, usuario);
        boolean esAutor = acceso.esEstudianteDe(proyecto, usuario)
            && asesoria.getRegistradaPor().getId().equals(usuario.getId());
        if (!esAsesor && !esAutor) {
            throw new ForbiddenException("Solo el asesor o quien programó la reunión puede hacer esto");
        }
    }

    private Asesoria buscar(Long asesoriaId) {
        return asesoriaRepository.findById(asesoriaId)
            .orElseThrow(() -> new NotFoundException("Asesoría no encontrada"));
    }
}
