package com.tesistrack.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.ForbiddenException;
import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.CandidatoDto;
import com.tesistrack.dto.GrupoAbiertoDto;
import com.tesistrack.dto.InvitacionGrupoDto;
import com.tesistrack.dto.InvitarRequest;
import com.tesistrack.dto.ProyectoDto;
import com.tesistrack.dto.UnirseRequest;
import com.tesistrack.model.Area;
import com.tesistrack.model.InvitacionGrupo;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.Role;
import com.tesistrack.model.User;
import com.tesistrack.repository.EntregaRepository;
import com.tesistrack.repository.InvitacionGrupoRepository;
import com.tesistrack.repository.ProyectoRepository;
import com.tesistrack.repository.UserRepository;

/**
 * Los grupos de una clase desde el lado del estudiante (Decisiones 30 y 31): ver los
 * grupos abiertos al entrar con el código, sumarse a uno, e invitar a un compañero
 * de la clase que trabaja solo.
 *
 * <p>Todo pasa por {@link ReglasGrupo}: un grupo por clase y el cupo de la clase.
 */
@Service
@Transactional
public class GrupoService {

    private final ProyectoRepository proyectoRepository;
    private final UserRepository userRepository;
    private final EntregaRepository entregaRepository;
    private final InvitacionGrupoRepository invitaciones;
    private final AreaService areaService;
    private final ProyectoService proyectoService;
    private final AccesoService acceso;
    private final ReglasGrupo reglas;

    public GrupoService(
            ProyectoRepository proyectoRepository,
            UserRepository userRepository,
            EntregaRepository entregaRepository,
            InvitacionGrupoRepository invitaciones,
            AreaService areaService,
            ProyectoService proyectoService,
            AccesoService acceso,
            ReglasGrupo reglas) {
        this.proyectoRepository = proyectoRepository;
        this.userRepository = userRepository;
        this.entregaRepository = entregaRepository;
        this.invitaciones = invitaciones;
        this.areaService = areaService;
        this.proyectoService = proyectoService;
        this.acceso = acceso;
        this.reglas = reglas;
    }

    /**
     * Los grupos abiertos de la clase de ese código. Los ve solo quien tiene el código
     * (ajusta la Decisión 15): con nombres y tema, sin correos.
     */
    @Transactional(readOnly = true)
    public List<GrupoAbiertoDto> gruposAbiertos(String codigo, Authentication authentication) {
        estudiante(authentication);
        Area area = areaService.buscarPorCodigo(codigo);
        return proyectoRepository.findByAreaId(area.getId()).stream()
            .filter(Proyecto::isGrupal)
            .map(p -> new GrupoAbiertoDto(
                p.getId(),
                p.tieneTema() ? p.getTitulo() : null,
                p.getEstudiantesOrdenados().stream().map(User::getName).toList(),
                area.getTopeGrupo(),
                reglas.cupoLibre(p)))
            .toList();
    }

    /**
     * Sumarse a un grupo abierto con el código de su clase. El código se vuelve a
     * pedir acá a propósito: es la prueba de que quien se suma tiene la llave de esa
     * clase, aunque haya escrito el id del grupo a mano.
     */
    public ProyectoDto unirme(Long proyectoId, UnirseRequest request, Authentication authentication) {
        User yo = estudiante(authentication);
        Proyecto grupo = proyectoService.buscar(proyectoId);
        Area area = areaService.buscarPorCodigo(request.codigo());
        if (grupo.getArea() == null || !grupo.getArea().getId().equals(area.getId())) {
            throw new ForbiddenException("Ese grupo no es de la clase de este código");
        }
        if (!grupo.isGrupal()) {
            throw new ForbiddenException("Esa tesis es individual: no acepta compañeros");
        }
        if (grupo.tieneEstudiante(yo.getId())) {
            throw new IllegalArgumentException("Ya estás en ese grupo");
        }
        reglas.verificarSinGrupoEnClase(yo, area, null, true);
        reglas.verificarCupo(grupo);

        grupo.agregarEstudiante(yo);
        invitaciones.borrarDeLaClase(yo.getId(), area.getId());
        return ProyectoDto.from(grupo);
    }

    /**
     * A quiénes se puede invitar: compañeros de la misma clase que trabajan solos y
     * todavía no entregaron nada. Quien ya tiene entregas no aparece: aceptar le
     * borraría su tesis, y con ella su trabajo.
     */
    @Transactional(readOnly = true)
    public List<CandidatoDto> candidatos(Long proyectoId, Authentication authentication) {
        User yo = estudiante(authentication);
        Proyecto grupo = proyectoDeLaClase(proyectoId, yo);
        return proyectoRepository.findByAreaId(grupo.getArea().getId()).stream()
            .filter(p -> !p.getId().equals(grupo.getId()) && esSoloYSinEntregas(p))
            .map(p -> p.getEstudiantesOrdenados().get(0))
            .map(u -> new CandidatoDto(u.getId(), u.getName(),
                invitaciones.existsByProyectoIdAndInvitadoId(grupo.getId(), u.getId())))
            .toList();
    }

    public InvitacionGrupoDto invitar(Long proyectoId, InvitarRequest request, Authentication authentication) {
        User yo = estudiante(authentication);
        Proyecto grupo = proyectoDeLaClase(proyectoId, yo);
        reglas.verificarCupo(grupo);

        User invitado = userRepository.findById(request.estudianteId())
            .orElseThrow(() -> new NotFoundException("No encontramos a esa persona en la clase"));
        Proyecto suTesis = reglas.grupoEnClase(invitado, grupo.getArea(), grupo.getId())
            .orElseThrow(() -> new IllegalArgumentException("Esa persona no está en esta clase"));
        if (!esSoloYSinEntregas(suTesis)) {
            throw new IllegalArgumentException(
                "Solo se puede invitar a quien trabaja solo y todavía no entregó nada");
        }
        if (invitaciones.existsByProyectoIdAndInvitadoId(grupo.getId(), invitado.getId())) {
            throw new IllegalArgumentException("Ya le mandaste una invitación");
        }

        InvitacionGrupo inv = new InvitacionGrupo();
        inv.setProyecto(grupo);
        inv.setInvitado(invitado);
        inv.setInvitador(yo);
        return InvitacionGrupoDto.from(invitaciones.save(inv));
    }

    @Transactional(readOnly = true)
    public List<InvitacionGrupoDto> enviadas(Long proyectoId, Authentication authentication) {
        User yo = estudiante(authentication);
        Proyecto grupo = proyectoService.buscar(proyectoId);
        acceso.verificarEstudianteDelProyecto(grupo, yo);
        return invitaciones.findByProyectoIdOrderByCreatedAtDesc(proyectoId).stream()
            .map(InvitacionGrupoDto::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<InvitacionGrupoDto> recibidas(Authentication authentication) {
        User yo = acceso.usuarioActual(authentication);
        return invitaciones.findByInvitadoIdOrderByCreatedAtDesc(yo.getId()).stream()
            .map(InvitacionGrupoDto::from)
            .toList();
    }

    /**
     * Aceptar: el invitado pasa al grupo y su tesis individual de esa clase —vacía,
     * sin entregas— se borra (Decisión 31). Se vuelven a chequear las reglas: entre
     * la invitación y la aceptación el grupo pudo llenarse o el invitado entregar algo.
     */
    public ProyectoDto aceptar(Long invitacionId, Authentication authentication) {
        User yo = estudiante(authentication);
        InvitacionGrupo inv = invitacion(invitacionId);
        if (!inv.getInvitado().getId().equals(yo.getId())) {
            throw new ForbiddenException("Esa invitación no es para vos");
        }
        Proyecto grupo = inv.getProyecto();
        Area area = grupo.getArea();
        if (area == null) {
            throw new IllegalArgumentException("Ese grupo ya no está en una clase");
        }
        reglas.verificarCupo(grupo);

        Optional<Proyecto> suTesis = reglas.grupoEnClase(yo, area, grupo.getId());
        if (suTesis.isPresent()) {
            Proyecto propia = suTesis.get();
            if (propia.getEstudiantes().size() > 1) {
                throw new IllegalArgumentException(
                    "Ya estás en otro grupo de esta clase. Para cambiarte, salí primero del que tenés.");
            }
            if (!entregaRepository.findByHitoProyectoId(propia.getId()).isEmpty()) {
                throw new IllegalArgumentException(
                    "Tu tesis individual ya tiene entregas: si aceptás, se perderían. Hablalo con tu profesor.");
            }
            proyectoService.borrarTodo(propia);
        }

        grupo.agregarEstudiante(yo);
        grupo.setGrupal(true);
        invitaciones.borrarDeLaClase(yo.getId(), area.getId());
        return ProyectoDto.from(grupo);
    }

    /** Rechazar (el invitado) o cancelar (alguien del grupo que invitó). */
    public void descartar(Long invitacionId, Authentication authentication) {
        User yo = acceso.usuarioActual(authentication);
        InvitacionGrupo inv = invitacion(invitacionId);
        boolean esInvitado = inv.getInvitado().getId().equals(yo.getId());
        boolean esDelGrupo = acceso.esEstudianteDe(inv.getProyecto(), yo);
        if (!esInvitado && !esDelGrupo) {
            throw new ForbiddenException("Esa invitación no es tuya");
        }
        invitaciones.delete(inv);
    }

    private boolean esSoloYSinEntregas(Proyecto p) {
        return !p.isGrupal()
            && p.getEstudiantes().size() == 1
            && entregaRepository.findByHitoProyectoId(p.getId()).isEmpty();
    }

    private Proyecto proyectoDeLaClase(Long proyectoId, User yo) {
        Proyecto grupo = proyectoService.buscar(proyectoId);
        acceso.verificarEstudianteDelProyecto(grupo, yo);
        if (grupo.getArea() == null) {
            throw new IllegalArgumentException(
                "Tu tesis no está en una clase: sumá compañeros con su correo");
        }
        return grupo;
    }

    private InvitacionGrupo invitacion(Long id) {
        return invitaciones.findById(id)
            .orElseThrow(() -> new NotFoundException("Esa invitación ya no existe"));
    }

    private User estudiante(Authentication authentication) {
        User yo = acceso.usuarioActual(authentication);
        if (yo.getRole() != Role.ESTUDIANTE) {
            throw new ForbiddenException("Los grupos son de los estudiantes");
        }
        return yo;
    }
}
