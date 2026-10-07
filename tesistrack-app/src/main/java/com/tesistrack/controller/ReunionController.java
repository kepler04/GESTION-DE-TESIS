package com.tesistrack.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tesistrack.dto.ReunionDto;
import com.tesistrack.service.ReunionService;

@RestController
@RequestMapping("/api/reuniones")
public class ReunionController {

    private final ReunionService reunionService;

    public ReunionController(ReunionService reunionService) {
        this.reunionService = reunionService;
    }

    /** Las próximas reuniones del usuario (sesiones de su espacio y asesorías programadas). */
    @GetMapping("/proximas")
    public List<ReunionDto> proximas(Authentication authentication) {
        return reunionService.proximas(authentication);
    }
}
