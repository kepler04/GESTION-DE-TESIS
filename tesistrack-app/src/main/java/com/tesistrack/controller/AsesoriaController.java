package com.tesistrack.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tesistrack.dto.AcuerdoDto;
import com.tesistrack.dto.AsesoriaDto;
import com.tesistrack.dto.CrearAcuerdoRequest;
import com.tesistrack.dto.CrearAsesoriaRequest;
import com.tesistrack.service.AsesoriaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class AsesoriaController {

    private final AsesoriaService asesoriaService;

    public AsesoriaController(AsesoriaService asesoriaService) {
        this.asesoriaService = asesoriaService;
    }

    @PostMapping("/proyectos/{proyectoId}/asesorias")
    @ResponseStatus(HttpStatus.CREATED)
    public AsesoriaDto crear(
            @PathVariable Long proyectoId,
            @Valid @RequestBody CrearAsesoriaRequest request,
            Authentication authentication) {
        return asesoriaService.crear(proyectoId, request, authentication);
    }

    @GetMapping("/proyectos/{proyectoId}/asesorias")
    public List<AsesoriaDto> listar(@PathVariable Long proyectoId, Authentication authentication) {
        return asesoriaService.listar(proyectoId, authentication);
    }

    @PostMapping("/asesorias/{asesoriaId}/acuerdos")
    @ResponseStatus(HttpStatus.CREATED)
    public AcuerdoDto crearAcuerdo(
            @PathVariable Long asesoriaId,
            @Valid @RequestBody CrearAcuerdoRequest request,
            Authentication authentication) {
        return asesoriaService.crearAcuerdo(asesoriaId, request, authentication);
    }

    @GetMapping("/asesorias/{asesoriaId}/acuerdos")
    public List<AcuerdoDto> listarAcuerdos(
            @PathVariable Long asesoriaId, Authentication authentication) {
        return asesoriaService.listarAcuerdos(asesoriaId, authentication);
    }
}
