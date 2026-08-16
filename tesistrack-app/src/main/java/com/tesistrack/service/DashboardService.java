package com.tesistrack.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.dto.AsesoriaDto;
import com.tesistrack.dto.DashboardDto;
import com.tesistrack.dto.EntregaDto;
import com.tesistrack.dto.HitoDto;
import com.tesistrack.dto.ObservacionDto;
import com.tesistrack.dto.ProyectoDto;
import com.tesistrack.dto.TareaDto;
import com.tesistrack.model.EstadoHito;
import com.tesistrack.model.EstadoObservacion;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.User;
import com.tesistrack.repository.AsesoriaRepository;
import com.tesistrack.repository.EntregaRepository;
import com.tesistrack.repository.HitoRepository;
import com.tesistrack.repository.ObservacionRepository;
import com.tesistrack.repository.TareaRepository;

/** Resumen de un proyecto, con lo que pide la sección Dashboard de Funcionalidades.md. */
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final int MAX_ASESORIAS = 5;

    private final HitoRepository hitoRepository;
    private final EntregaRepository entregaRepository;
    private final ObservacionRepository observacionRepository;
    private final AsesoriaRepository asesoriaRepository;
    private final TareaRepository tareaRepository;
    private final ProyectoService proyectoService;
    private final AccesoService acceso;

    public DashboardService(
            HitoRepository hitoRepository,
            EntregaRepository entregaRepository,
            ObservacionRepository observacionRepository,
            AsesoriaRepository asesoriaRepository,
            TareaRepository tareaRepository,
            ProyectoService proyectoService,
            AccesoService acceso) {
        this.hitoRepository = hitoRepository;
        this.entregaRepository = entregaRepository;
        this.observacionRepository = observacionRepository;
        this.asesoriaRepository = asesoriaRepository;
        this.tareaRepository = tareaRepository;
        this.proyectoService = proyectoService;
        this.acceso = acceso;
    }

    public DashboardDto resumen(Long proyectoId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Proyecto proyecto = proyectoService.buscar(proyectoId);
        acceso.verificarLectura(proyecto, usuario);

        List<HitoDto> proximosHitos = hitoRepository.findByProyectoIdOrderByOrdenAsc(proyectoId).stream()
            .filter(hito -> hito.getEstado() != EstadoHito.COMPLETADO)
            .map(HitoDto::from)
            .toList();

        List<TareaDto> tareasPendientes =
            tareaRepository.findByProyectoIdAndCompletada(proyectoId, false).stream()
                .map(TareaDto::from)
                .toList();

        EntregaDto ultimaEntrega = entregaRepository
            .findFirstByHitoProyectoIdOrderByCreatedAtDesc(proyectoId)
            .map(EntregaDto::from)
            .orElse(null);

        List<ObservacionDto> observacionesPendientes = observacionRepository
            .findByEntregaHitoProyectoIdAndEstado(proyectoId, EstadoObservacion.PENDIENTE).stream()
            .map(ObservacionDto::from)
            .toList();

        List<AsesoriaDto> ultimasAsesorias =
            asesoriaRepository.findByProyectoIdOrderByFechaDesc(proyectoId).stream()
                .limit(MAX_ASESORIAS)
                .map(AsesoriaDto::from)
                .toList();

        return new DashboardDto(
            ProyectoDto.from(proyecto),
            proximosHitos,
            tareasPendientes,
            ultimaEntrega,
            observacionesPendientes,
            ultimasAsesorias);
    }
}
