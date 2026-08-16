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

import com.tesistrack.dto.CrearEntregaRequest;
import com.tesistrack.dto.EntregaDto;
import com.tesistrack.service.EntregaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/hitos/{hitoId}/entregas")
public class EntregaController {

    private final EntregaService entregaService;

    public EntregaController(EntregaService entregaService) {
        this.entregaService = entregaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EntregaDto crear(
            @PathVariable Long hitoId,
            @Valid @RequestBody CrearEntregaRequest request,
            Authentication authentication) {
        return entregaService.crear(hitoId, request, authentication);
    }

    @GetMapping
    public List<EntregaDto> listar(@PathVariable Long hitoId, Authentication authentication) {
        return entregaService.listar(hitoId, authentication);
    }
}
