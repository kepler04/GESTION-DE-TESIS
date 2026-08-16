package com.tesistrack.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.CambiarEstadoObservacionRequest;
import com.tesistrack.dto.CrearObservacionRequest;
import com.tesistrack.dto.ObservacionDto;
import com.tesistrack.model.Entrega;
import com.tesistrack.model.EstadoEntrega;
import com.tesistrack.model.EstadoHito;
import com.tesistrack.model.Observacion;
import com.tesistrack.model.User;
import com.tesistrack.repository.ObservacionRepository;

/**
 * Observaciones del asesor sobre una entrega concreta (Decisión 6): cuelgan de la
 * versión que las originó, no del hito.
 */
@Service
@Transactional
public class ObservacionService {

    private final ObservacionRepository observacionRepository;
    private final EntregaService entregaService;
    private final AccesoService acceso;

    public ObservacionService(
            ObservacionRepository observacionRepository,
            EntregaService entregaService,
            AccesoService acceso) {
        this.observacionRepository = observacionRepository;
        this.entregaService = entregaService;
        this.acceso = acceso;
    }

    public ObservacionDto crear(Long entregaId, CrearObservacionRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Entrega entrega = entregaService.buscar(entregaId);
        acceso.verificarAsesorDelProyecto(entrega.getHito().getProyecto(), usuario);

        Observacion observacion = new Observacion();
        observacion.setEntrega(entrega);
        observacion.setDescripcion(request.descripcion());
        observacion.setRegistradaPor(usuario);

        // Observar una entrega devuelve el hito al estado OBSERVADO: hay algo que corregir.
        entrega.getHito().setEstado(EstadoHito.OBSERVADO);
        // Y deja marcada la versión concreta: el hito avanza, pero esta versión queda
        // observada para siempre en el historial.
        entrega.setEstado(EstadoEntrega.OBSERVADA);

        return ObservacionDto.from(observacionRepository.save(observacion));
    }

    @Transactional(readOnly = true)
    public List<ObservacionDto> listar(Long entregaId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Entrega entrega = entregaService.buscar(entregaId);
        acceso.verificarLectura(entrega.getHito().getProyecto(), usuario);
        return observacionRepository.findByEntregaId(entregaId).stream()
            .map(ObservacionDto::from)
            .toList();
    }

    public ObservacionDto cambiarEstado(
            Long observacionId, CambiarEstadoObservacionRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Observacion observacion = observacionRepository.findById(observacionId)
            .orElseThrow(() -> new NotFoundException("Observación no encontrada"));
        acceso.verificarAsesorDelProyecto(observacion.getEntrega().getHito().getProyecto(), usuario);

        observacion.setEstado(request.estado());
        return ObservacionDto.from(observacion);
    }
}
