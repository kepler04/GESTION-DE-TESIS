package com.tesistrack.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tesistrack.dto.DashboardAsesorDto;
import com.tesistrack.service.DashboardAsesorService;

/**
 * El Dashboard del profesor. Es aparte del de un proyecto
 * ({@code /proyectos/{id}/dashboard}), que es la vista de un estudiante.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardAsesorController {

    private final DashboardAsesorService dashboardAsesorService;

    public DashboardAsesorController(DashboardAsesorService dashboardAsesorService) {
        this.dashboardAsesorService = dashboardAsesorService;
    }

    @GetMapping("/asesor")
    public DashboardAsesorDto asesor(Authentication authentication) {
        return dashboardAsesorService.resumen(authentication);
    }
}
