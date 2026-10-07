package com.tesistrack.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tesistrack.dto.SesionDto;
import com.tesistrack.dto.SesionRequest;
import com.tesistrack.service.SesionService;

import jakarta.validation.Valid;

/** Sesiones de un espacio: clases o reuniones para todos sus miembros, con enlace. */
@RestController
@RequestMapping("/api")
public class SesionController {

    private final SesionService sesionService;

    public SesionController(SesionService sesionService) {
        this.sesionService = sesionService;
    }

    @GetMapping("/areas/{areaId}/sesiones")
    public List<SesionDto> listar(@PathVariable Long areaId, Authentication authentication) {
        return sesionService.listar(areaId, authentication);
    }

    @PostMapping("/areas/{areaId}/sesiones")
    @ResponseStatus(HttpStatus.CREATED)
    public SesionDto crear(
            @PathVariable Long areaId,
            @Valid @RequestBody SesionRequest request,
            Authentication authentication) {
        return sesionService.crear(areaId, request, authentication);
    }

    @PutMapping("/sesiones/{id}")
    public SesionDto actualizar(
            @PathVariable Long id,
            @Valid @RequestBody SesionRequest request,
            Authentication authentication) {
        return sesionService.actualizar(id, request, authentication);
    }

    @DeleteMapping("/sesiones/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id, Authentication authentication) {
        sesionService.eliminar(id, authentication);
    }
}
