package com.tesistrack.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.ForbiddenException;
import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.AreaDto;
import com.tesistrack.dto.AreaRequest;
import com.tesistrack.dto.EspacioDto;
import com.tesistrack.dto.ResumenEspacioDto;
import com.tesistrack.model.Actividad;
import com.tesistrack.model.Area;
import com.tesistrack.model.CarpetaMaterial;
import com.tesistrack.model.Material;
import com.tesistrack.model.Role;
import com.tesistrack.model.SesionEspacio;
import com.tesistrack.model.User;
import com.tesistrack.repository.ActividadRepository;
import com.tesistrack.repository.ArchivoMaterialRepository;
import com.tesistrack.repository.AreaRepository;
import com.tesistrack.repository.CarpetaMaterialRepository;
import com.tesistrack.repository.HitoRepository;
import com.tesistrack.repository.MaterialRepository;
import com.tesistrack.repository.ProyectoRepository;
import com.tesistrack.repository.SesionEspacioRepository;

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

    /**
     * Carpetas de material que recibe todo espacio nuevo. Son una sugerencia: el
     * asesor las puede renombrar o borrar. (La migración V2 se las dio a los
     * espacios que ya existían.)
     */
    static final List<String> CARPETAS_INICIALES = List.of("Temas de tesis", "Rúbrica", "Clases");

    private final AreaRepository areaRepository;
    private final ProyectoRepository proyectoRepository;
    private final ActividadRepository actividadRepository;
    private final HitoRepository hitoRepository;
    private final CarpetaMaterialRepository carpetaRepository;
    private final MaterialRepository materialRepository;
    private final ArchivoMaterialRepository archivoMaterialRepository;
    private final SesionEspacioRepository sesionRepository;
    private final AccesoService acceso;
    private final GeneradorCodigos generadorCodigos;

    public AreaService(
            AreaRepository areaRepository,
            ProyectoRepository proyectoRepository,
            ActividadRepository actividadRepository,
            HitoRepository hitoRepository,
            CarpetaMaterialRepository carpetaRepository,
            MaterialRepository materialRepository,
            ArchivoMaterialRepository archivoMaterialRepository,
            SesionEspacioRepository sesionRepository,
            AccesoService acceso,
            GeneradorCodigos generadorCodigos) {
        this.areaRepository = areaRepository;
        this.proyectoRepository = proyectoRepository;
        this.actividadRepository = actividadRepository;
        this.hitoRepository = hitoRepository;
        this.carpetaRepository = carpetaRepository;
        this.materialRepository = materialRepository;
        this.archivoMaterialRepository = archivoMaterialRepository;
        this.sesionRepository = sesionRepository;
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
        areaRepository.save(area);

        int orden = 1;
        for (String nombre : CARPETAS_INICIALES) {
            CarpetaMaterial carpeta = new CarpetaMaterial();
            carpeta.setArea(area);
            carpeta.setNombre(nombre);
            carpeta.setOrden(orden++);
            carpetaRepository.save(carpeta);
        }
        return AreaDto.from(area);
    }

    /**
     * La página de un espacio, para quien tenga derecho a verla: su dueño, los
     * estudiantes que tienen una tesis en él y el coordinador (que lee todo).
     */
    @Transactional(readOnly = true)
    public EspacioDto espacio(Long id, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Area area = buscarComoMiembro(id, usuario);
        return EspacioDto.from(area, esPropietario(area, usuario));
    }

    /**
     * Lo que se pierde y lo que se queda si se borra el espacio, en números. Es
     * solo del dueño: el diálogo de borrado lo usa para no hablar en abstracto.
     */
    @Transactional(readOnly = true)
    public ResumenEspacioDto resumen(Long id, Authentication authentication) {
        User usuario = soloAsesor(authentication);
        Area area = buscarPropia(id, usuario);
        return new ResumenEspacioDto(
            actividadRepository.findByAreaIdOrderByOrdenAsc(area.getId()).size(),
            proyectoRepository.findByAreaId(area.getId()).size(),
            carpetaRepository.countByAreaId(area.getId()),
            materialRepository.countByCarpetaAreaId(area.getId()),
            materialRepository.countByCarpetaAreaIdAndArchivoNombreIsNotNull(area.getId()),
            sesionRepository.countByAreaId(area.getId()));
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
     * Borra el espacio: se van sus actividades, sus materiales (carpetas, enlaces y
     * archivos) y sus sesiones; las tesis y todos sus hitos se quedan.
     *
     * Se descartó bloquear el borrado cuando el espacio está en uso: obligar a
     * desetiquetar proyecto por proyecto sería un trámite sin ningún valor.
     *
     * <p>El orden importa. {@code actividad.area_id} es NOT NULL y
     * {@code hito.actividad_id} apunta a la actividad: primero se sueltan los hitos,
     * después se borran las actividades. Los materiales van de la hoja a la raíz
     * (bytes del archivo, material, carpeta) y las sesiones cuelgan solo del área.
     * Por último se desvinculan los proyectos y cae el área. Los bytes se borran con
     * una consulta directa: cargar los archivos como entidades solo para borrarlos
     * traería hasta 15 MB por cada uno a memoria.
     *
     * <p>A diferencia de {@link ActividadService#eliminar}, que quita <b>una</b>
     * actividad y borra los hitos que nadie tocó, acá ningún hito se borra: es
     * trabajo del estudiante y el asesor se está yendo del espacio, no limpiando
     * una consigna (Decisión 18; la 12 sigue valiendo para ese otro caso).
     */
    public void eliminar(Long id, Authentication authentication) {
        User usuario = soloAsesor(authentication);
        Area area = buscarPropia(id, usuario);

        List<Actividad> actividades = actividadRepository.findByAreaIdOrderByOrdenAsc(area.getId());
        for (Actividad actividad : actividades) {
            hitoRepository.findByActividadId(actividad.getId()).forEach(h -> h.setActividad(null));
        }
        actividadRepository.deleteAll(actividades);

        archivoMaterialRepository.borrarDeArea(area.getId());
        List<Material> materiales =
            materialRepository.findByCarpetaAreaIdOrderByCreatedAtAscIdAsc(area.getId());
        materialRepository.deleteAll(materiales);
        List<CarpetaMaterial> carpetas = carpetaRepository.findByAreaIdOrderByOrdenAscIdAsc(area.getId());
        carpetaRepository.deleteAll(carpetas);
        List<SesionEspacio> sesiones = sesionRepository.findByAreaIdOrderByFechaHoraAsc(area.getId());
        sesionRepository.deleteAll(sesiones);

        proyectoRepository.findByAreaId(area.getId()).forEach(p -> p.setArea(null));
        areaRepository.delete(area);
    }

    /**
     * Área a la que el usuario tiene derecho a entrar: la suya si es el asesor
     * dueño, la de su tesis si es estudiante, cualquiera si es coordinador (lee
     * todo, no escribe nada: Decisión 8).
     */
    @Transactional(readOnly = true)
    public Area buscarComoMiembro(Long id, User usuario) {
        Area area = areaRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Espacio no encontrado"));
        if (usuario.getRole() == Role.COORDINADOR || esPropietario(area, usuario)) {
            return area;
        }
        if (usuario.getRole() == Role.ESTUDIANTE
                && proyectoRepository.existsByAreaIdAndEstudiantesId(area.getId(), usuario.getId())) {
            return area;
        }
        throw new ForbiddenException("No sos parte de este espacio");
    }

    boolean esPropietario(Area area, User usuario) {
        return usuario.getRole() == Role.ASESOR
            && area.getPropietario().getId().equals(usuario.getId());
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
