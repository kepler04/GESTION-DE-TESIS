package com.tesistrack.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tesistrack.dto.CambiarEstadoHitoRequest;
import com.tesistrack.dto.HitoDto;
import com.tesistrack.dto.HitoRequest;
import com.tesistrack.service.HitoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class HitoController {

    private final HitoService hitoService;

    public HitoController(HitoService hitoService) {
        this.hitoService = hitoService;
    }

    @PostMapping("/proyectos/{proyectoId}/hitos")
    @ResponseStatus(HttpStatus.CREATED)
    public HitoDto crear(
            @PathVariable Long proyectoId,
            @Valid @RequestBody HitoRequest request,
            Authentication authentication) {
        return hitoService.crear(proyectoId, request, authentication);
    }

    @GetMapping("/proyectos/{proyectoId}/hitos")
    public List<HitoDto> listar(@PathVariable Long proyectoId, Authentication authentication) {
        return hitoService.listar(proyectoId, authentication);
    }

    @PutMapping("/hitos/{id}")
    public HitoDto actualizar(
            @PathVariable Long id,
            @Valid @RequestBody HitoRequest request,
            Authentication authentication) {
        return hitoService.actualizar(id, request, authentication);
    }

    @PatchMapping("/hitos/{id}/estado")
    public HitoDto cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoHitoRequest request,
            Authentication authentication) {
        return hitoService.cambiarEstado(id, request, authentication);
    }

    @DeleteMapping("/hitos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id, Authentication authentication) {
        hitoService.eliminar(id, authentication);
    }
}
