package com.tesistrack.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tesistrack.dto.AsignarAsesorRequest;
import com.tesistrack.dto.CrearProyectoRequest;
import com.tesistrack.dto.DashboardDto;
import com.tesistrack.dto.ProyectoDto;
import com.tesistrack.service.DashboardService;
import com.tesistrack.service.ProyectoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    private final ProyectoService proyectoService;
    private final DashboardService dashboardService;

    public ProyectoController(ProyectoService proyectoService, DashboardService dashboardService) {
        this.proyectoService = proyectoService;
        this.dashboardService = dashboardService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProyectoDto crear(
            @Valid @RequestBody CrearProyectoRequest request, Authentication authentication) {
        return proyectoService.crear(request, authentication);
    }

    @GetMapping
    public List<ProyectoDto> listar(Authentication authentication) {
        return proyectoService.listar(authentication);
    }

    @GetMapping("/{id}")
    public ProyectoDto obtener(@PathVariable Long id, Authentication authentication) {
        return proyectoService.obtener(id, authentication);
    }

    @PatchMapping("/{id}/asesor")
    public ProyectoDto asignarAsesor(
            @PathVariable Long id,
            @Valid @RequestBody AsignarAsesorRequest request,
            Authentication authentication) {
        return proyectoService.asignarAsesor(id, request, authentication);
    }

    @GetMapping("/{id}/dashboard")
    public DashboardDto dashboard(@PathVariable Long id, Authentication authentication) {
        return dashboardService.resumen(id, authentication);
    }
}
