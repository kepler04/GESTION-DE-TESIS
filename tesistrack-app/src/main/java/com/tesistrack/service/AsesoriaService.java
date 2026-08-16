package com.tesistrack.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.AcuerdoDto;
import com.tesistrack.dto.AsesoriaDto;
import com.tesistrack.dto.CrearAcuerdoRequest;
import com.tesistrack.dto.CrearAsesoriaRequest;
import com.tesistrack.model.Acuerdo;
import com.tesistrack.model.Asesoria;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.User;
import com.tesistrack.repository.AcuerdoRepository;
import com.tesistrack.repository.AsesoriaRepository;

/** Cadena asesoría → acuerdo. Las tareas que derivan de un acuerdo las maneja {@link TareaService}. */
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

    public AsesoriaDto crear(Long proyectoId, CrearAsesoriaRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Proyecto proyecto = proyectoService.buscar(proyectoId);
        acceso.verificarAsesorDelProyecto(proyecto, usuario);

        Asesoria asesoria = new Asesoria();
        asesoria.setProyecto(proyecto);
        asesoria.setFecha(request.fecha());
        asesoria.setTema(request.tema());
        asesoria.setResumen(request.resumen());
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

    public AcuerdoDto crearAcuerdo(Long asesoriaId, CrearAcuerdoRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Asesoria asesoria = buscar(asesoriaId);
        acceso.verificarAsesorDelProyecto(asesoria.getProyecto(), usuario);

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

    private Asesoria buscar(Long asesoriaId) {
        return asesoriaRepository.findById(asesoriaId)
            .orElseThrow(() -> new NotFoundException("Asesoría no encontrada"));
    }
}
