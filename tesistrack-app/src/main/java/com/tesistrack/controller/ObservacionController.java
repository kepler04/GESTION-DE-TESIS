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

import com.tesistrack.dto.CambiarEstadoObservacionRequest;
import com.tesistrack.dto.CrearObservacionRequest;
import com.tesistrack.dto.ObservacionDto;
import com.tesistrack.service.ObservacionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ObservacionController {

    private final ObservacionService observacionService;

    public ObservacionController(ObservacionService observacionService) {
        this.observacionService = observacionService;
    }

    @PostMapping("/entregas/{entregaId}/observaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public ObservacionDto crear(
            @PathVariable Long entregaId,
            @Valid @RequestBody CrearObservacionRequest request,
            Authentication authentication) {
        return observacionService.crear(entregaId, request, authentication);
    }

    @GetMapping("/entregas/{entregaId}/observaciones")
    public List<ObservacionDto> listar(@PathVariable Long entregaId, Authentication authentication) {
        return observacionService.listar(entregaId, authentication);
    }

    @PatchMapping("/observaciones/{id}/estado")
    public ObservacionDto cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoObservacionRequest request,
            Authentication authentication) {
        return observacionService.cambiarEstado(id, request, authentication);
    }
}
