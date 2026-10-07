package com.tesistrack.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.SesionDto;
import com.tesistrack.dto.SesionRequest;
import com.tesistrack.model.Area;
import com.tesistrack.model.SesionEspacio;
import com.tesistrack.model.User;
import com.tesistrack.repository.SesionEspacioRepository;

/**
 * Las sesiones de un espacio: una clase o reunión para todos sus miembros, con
 * fecha, hora y el enlace que pega el asesor. La crea y la edita el dueño del
 * espacio; las ven todos los miembros, con un botón Unirse.
 */
@Service
@Transactional
public class SesionService {

    private final SesionEspacioRepository sesionRepository;
    private final AreaService areaService;
    private final AccesoService acceso;

    public SesionService(
            SesionEspacioRepository sesionRepository, AreaService areaService, AccesoService acceso) {
        this.sesionRepository = sesionRepository;
        this.areaService = areaService;
        this.acceso = acceso;
    }

    /** Todas las sesiones, la más próxima primero: la pantalla separa las pasadas. */
    @Transactional(readOnly = true)
    public List<SesionDto> listar(Long areaId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        areaService.buscarComoMiembro(areaId, usuario);
        return sesionRepository.findByAreaIdOrderByFechaHoraAsc(areaId).stream()
            .map(SesionDto::from)
            .toList();
    }

    public SesionDto crear(Long areaId, SesionRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Area area = areaService.buscarPropia(areaId, usuario);

        SesionEspacio sesion = new SesionEspacio();
        sesion.setArea(area);
        aplicar(sesion, request);
        return SesionDto.from(sesionRepository.save(sesion));
    }

    public SesionDto actualizar(Long id, SesionRequest request, Authentication authentication) {
        SesionEspacio sesion = sesionPropia(id, authentication);
        aplicar(sesion, request);
        return SesionDto.from(sesion);
    }

    public void eliminar(Long id, Authentication authentication) {
        sesionRepository.delete(sesionPropia(id, authentication));
    }

    private void aplicar(SesionEspacio sesion, SesionRequest request) {
        sesion.setTitulo(request.titulo().trim());
        sesion.setFechaHora(request.fechaHora());
        sesion.setEnlace(Enlaces.httpsObligatorio(request.enlace()));
    }

    private SesionEspacio sesionPropia(Long id, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        SesionEspacio sesion = sesionRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Sesión no encontrada"));
        areaService.buscarPropia(sesion.getArea().getId(), usuario);
        return sesion;
    }
}
