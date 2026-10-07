package com.tesistrack.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.AvisoDto;
import com.tesistrack.dto.AvisoRequest;
import com.tesistrack.model.Area;
import com.tesistrack.model.Aviso;
import com.tesistrack.model.User;
import com.tesistrack.repository.AvisoRepository;

/**
 * Avisos del Tablón: lo que el profesor le quiere decir a toda la clase. Los
 * publica y los borra el dueño; los leen todos los miembros.
 */
@Service
@Transactional
public class AvisoService {

    private final AvisoRepository avisoRepository;
    private final AreaService areaService;
    private final AccesoService acceso;

    public AvisoService(AvisoRepository avisoRepository, AreaService areaService, AccesoService acceso) {
        this.avisoRepository = avisoRepository;
        this.areaService = areaService;
        this.acceso = acceso;
    }

    /** El más nuevo primero. */
    @Transactional(readOnly = true)
    public List<AvisoDto> listar(Long areaId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        areaService.buscarComoMiembro(areaId, usuario);
        return avisoRepository.findByAreaIdOrderByCreatedAtDesc(areaId).stream()
            .map(AvisoDto::from)
            .toList();
    }

    public AvisoDto crear(Long areaId, AvisoRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Area area = areaService.buscarPropia(areaId, usuario);

        Aviso aviso = new Aviso();
        aviso.setArea(area);
        aviso.setTexto(request.texto());
        return AvisoDto.from(avisoRepository.save(aviso));
    }

    public void eliminar(Long id, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Aviso aviso = avisoRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Aviso no encontrado"));
        areaService.buscarPropia(aviso.getArea().getId(), usuario);
        avisoRepository.delete(aviso);
    }
}
