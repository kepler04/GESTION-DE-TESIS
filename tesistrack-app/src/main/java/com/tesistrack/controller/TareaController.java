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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tesistrack.dto.CrearTareaRequest;
import com.tesistrack.dto.TareaDto;
import com.tesistrack.service.TareaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class TareaController {

    private final TareaService tareaService;

    public TareaController(TareaService tareaService) {
        this.tareaService = tareaService;
    }

    @PostMapping("/proyectos/{proyectoId}/tareas")
    @ResponseStatus(HttpStatus.CREATED)
    public TareaDto crear(
            @PathVariable Long proyectoId,
            @Valid @RequestBody CrearTareaRequest request,
            Authentication authentication) {
        return tareaService.crear(proyectoId, request, authentication);
    }

    /** {@code ?completada=false} devuelve solo los pendientes. */
    @GetMapping("/proyectos/{proyectoId}/tareas")
    public List<TareaDto> listar(
            @PathVariable Long proyectoId,
            @RequestParam(required = false) Boolean completada,
            Authentication authentication) {
        return tareaService.listar(proyectoId, completada, authentication);
    }

    @PatchMapping("/tareas/{id}/completar")
    public TareaDto completar(@PathVariable Long id, Authentication authentication) {
        return tareaService.completar(id, authentication);
    }
}
