package com.tesistrack.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tesistrack.dto.AvisoDto;
import com.tesistrack.dto.AvisoRequest;
import com.tesistrack.service.AvisoService;

import jakarta.validation.Valid;

/** Avisos del Tablón de una clase. */
@RestController
@RequestMapping("/api")
public class AvisoController {

    private final AvisoService avisoService;

    public AvisoController(AvisoService avisoService) {
        this.avisoService = avisoService;
    }

    @GetMapping("/areas/{areaId}/avisos")
    public List<AvisoDto> listar(@PathVariable Long areaId, Authentication authentication) {
        return avisoService.listar(areaId, authentication);
    }

    @PostMapping("/areas/{areaId}/avisos")
    @ResponseStatus(HttpStatus.CREATED)
    public AvisoDto crear(
            @PathVariable Long areaId,
            @Valid @RequestBody AvisoRequest request,
            Authentication authentication) {
        return avisoService.crear(areaId, request, authentication);
    }

    @DeleteMapping("/avisos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id, Authentication authentication) {
        avisoService.eliminar(id, authentication);
    }
}
