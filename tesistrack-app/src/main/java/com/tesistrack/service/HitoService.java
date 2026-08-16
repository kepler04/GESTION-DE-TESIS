package com.tesistrack.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.CambiarEstadoHitoRequest;
import com.tesistrack.dto.HitoDto;
import com.tesistrack.dto.HitoRequest;
import com.tesistrack.model.Hito;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.User;
import com.tesistrack.repository.EntregaRepository;
import com.tesistrack.repository.HitoRepository;

/**
 * Los hitos los crea, edita y borra el asesor del proyecto (Decisión 2).
 * Se pueden editar siempre, pero solo borrar si no tienen entregas (Decisión 4).
 */
@Service
@Transactional
public class HitoService {

    private final HitoRepository hitoRepository;
    private final EntregaRepository entregaRepository;
    private final ProyectoService proyectoService;
    private final AccesoService acceso;

    public HitoService(
            HitoRepository hitoRepository,
            EntregaRepository entregaRepository,
            ProyectoService proyectoService,
            AccesoService acceso) {
        this.hitoRepository = hitoRepository;
        this.entregaRepository = entregaRepository;
        this.proyectoService = proyectoService;
        this.acceso = acceso;
    }

    public HitoDto crear(Long proyectoId, HitoRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Proyecto proyecto = proyectoService.buscar(proyectoId);
        acceso.verificarAsesorDelProyecto(proyecto, usuario);

        Hito hito = new Hito();
        hito.setProyecto(proyecto);
        aplicar(request, hito);
        return HitoDto.from(hitoRepository.save(hito));
    }

    @Transactional(readOnly = true)
    public List<HitoDto> listar(Long proyectoId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        acceso.verificarLectura(proyectoService.buscar(proyectoId), usuario);
        return hitoRepository.findByProyectoIdOrderByOrdenAsc(proyectoId).stream()
            .map(HitoDto::from)
            .toList();
    }

    public HitoDto actualizar(Long hitoId, HitoRequest request, Authentication authentication) {
        Hito hito = buscarComoAsesor(hitoId, authentication);
        aplicar(request, hito);
        return HitoDto.from(hito);
    }

    public HitoDto cambiarEstado(Long hitoId, CambiarEstadoHitoRequest request, Authentication authentication) {
        Hito hito = buscarComoAsesor(hitoId, authentication);
        hito.setEstado(request.estado());
        return HitoDto.from(hito);
    }

    public void eliminar(Long hitoId, Authentication authentication) {
        Hito hito = buscarComoAsesor(hitoId, authentication);
        if (entregaRepository.existsByHitoId(hitoId)) {
            throw new IllegalArgumentException(
                "No se puede borrar un hito que ya tiene entregas; se perdería el historial");
        }
        hitoRepository.delete(hito);
    }

    /** Carga el hito y verifica que quien pide sea el asesor de su proyecto. */
    private Hito buscarComoAsesor(Long hitoId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Hito hito = buscar(hitoId);
        acceso.verificarAsesorDelProyecto(hito.getProyecto(), usuario);
        return hito;
    }

    Hito buscar(Long hitoId) {
        return hitoRepository.findById(hitoId)
            .orElseThrow(() -> new NotFoundException("Hito no encontrado"));
    }

    private void aplicar(HitoRequest request, Hito hito) {
        hito.setNombre(request.nombre());
        hito.setDescripcion(request.descripcion());
        hito.setFechaLimite(request.fechaLimite());
        if (request.orden() != null) {
            hito.setOrden(request.orden());
        }
    }
}
