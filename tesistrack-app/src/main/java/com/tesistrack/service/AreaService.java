package com.tesistrack.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.ForbiddenException;
import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.AreaDto;
import com.tesistrack.dto.AreaRequest;
import com.tesistrack.model.Area;
import com.tesistrack.model.Role;
import com.tesistrack.model.User;
import com.tesistrack.repository.AreaRepository;
import com.tesistrack.repository.ProyectoRepository;

/**
 * Áreas con las que un asesor agrupa sus propias tesis.
 *
 * Cada área pertenece a un asesor y solo él la ve, la usa y la borra. No hay
 * áreas compartidas: eso sería la entidad {@code Institución} que descartó la
 * Decisión 1.
 */
@Service
@Transactional
public class AreaService {

    private final AreaRepository areaRepository;
    private final ProyectoRepository proyectoRepository;
    private final AccesoService acceso;
    private final GeneradorCodigos generadorCodigos;

    public AreaService(
            AreaRepository areaRepository,
            ProyectoRepository proyectoRepository,
            AccesoService acceso,
            GeneradorCodigos generadorCodigos) {
        this.areaRepository = areaRepository;
        this.proyectoRepository = proyectoRepository;
        this.acceso = acceso;
        this.generadorCodigos = generadorCodigos;
    }

    public AreaDto crear(AreaRequest request, Authentication authentication) {
        User usuario = soloAsesor(authentication);

        if (areaRepository.existsByPropietarioIdAndNombreIgnoreCase(usuario.getId(), request.nombre())) {
            throw new IllegalArgumentException("Ya tenés un área con ese nombre");
        }

        Area area = new Area();
        area.setNombre(request.nombre());
        area.setPropietario(usuario);
        area.setCodigo(generadorCodigos.generar(areaRepository::existsByCodigo));
        return AreaDto.from(areaRepository.save(area));
    }

    /**
     * Cambia el código del área. Sirve cuando el anterior se filtró: quien lo
     * tenga deja de poder sumarse, y los que ya entraron no se ven afectados.
     */
    public AreaDto regenerarCodigo(Long id, Authentication authentication) {
        User usuario = soloAsesor(authentication);
        Area area = buscarPropia(id, usuario);
        area.setCodigo(generadorCodigos.generar(areaRepository::existsByCodigo));
        return AreaDto.from(area);
    }

    /** Área a la que apunta un código de invitación. */
    @Transactional(readOnly = true)
    public Area buscarPorCodigo(String codigo) {
        return areaRepository.findByCodigo(normalizar(codigo))
            .orElseThrow(() -> new NotFoundException("Ese código de invitación no existe"));
    }

    /** El código se dicta y se copia a mano: se acepta en minúsculas y con espacios. */
    public static String normalizar(String codigo) {
        return codigo == null ? null : codigo.trim().toUpperCase(java.util.Locale.ROOT);
    }

    @Transactional(readOnly = true)
    public List<AreaDto> listar(Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        return areaRepository.findByPropietarioIdOrderByNombreAsc(usuario.getId()).stream()
            .map(AreaDto::from)
            .toList();
    }

    public AreaDto renombrar(Long id, AreaRequest request, Authentication authentication) {
        User usuario = soloAsesor(authentication);
        Area area = buscarPropia(id, usuario);

        if (!area.getNombre().equalsIgnoreCase(request.nombre())
                && areaRepository.existsByPropietarioIdAndNombreIgnoreCase(usuario.getId(), request.nombre())) {
            throw new IllegalArgumentException("Ya tenés un área con ese nombre");
        }

        area.setNombre(request.nombre());
        return AreaDto.from(area);
    }

    /**
     * Borra el área y la saca de los proyectos que la tenían.
     *
     * Se descartó bloquear el borrado cuando el área está en uso: es una etiqueta
     * organizativa, no un dato del proceso de tesis. Obligar a desetiquetar
     * proyecto por proyecto sería un trámite sin ningún valor.
     */
    public void eliminar(Long id, Authentication authentication) {
        User usuario = soloAsesor(authentication);
        Area area = buscarPropia(id, usuario);

        proyectoRepository.findByAreaId(area.getId()).forEach(p -> p.setArea(null));
        areaRepository.delete(area);
    }

    /** Área propia por id, o null si {@code areaId} viene en null (quitar el área). */
    Area resolverPropia(Long areaId, User usuario) {
        return areaId == null ? null : buscarPropia(areaId, usuario);
    }

    /** Visible para {@link ActividadService}, que trabaja siempre sobre un área propia. */
    Area buscarPropia(Long id, User usuario) {
        Area area = areaRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Área no encontrada"));
        // Mismo criterio que el resto de la app: pertenencia, no rol.
        if (!area.getPropietario().getId().equals(usuario.getId())) {
            throw new ForbiddenException("Esa área no es tuya");
        }
        return area;
    }

    private User soloAsesor(Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        if (usuario.getRole() != Role.ASESOR) {
            throw new ForbiddenException("Solo un asesor puede gestionar áreas");
        }
        return usuario;
    }
}
