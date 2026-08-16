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

import com.tesistrack.dto.ActividadDto;
import com.tesistrack.dto.ActividadRequest;
import com.tesistrack.dto.TableroDto;
import com.tesistrack.service.ActividadService;

import jakarta.validation.Valid;

/** Actividades de un espacio y el tablero que las cruza con los asesorados. */
@RestController
@RequestMapping("/api/areas/{areaId}")
public class ActividadController {

    private final ActividadService actividadService;

    public ActividadController(ActividadService actividadService) {
        this.actividadService = actividadService;
    }

    @PostMapping("/actividades")
    @ResponseStatus(HttpStatus.CREATED)
    public ActividadDto crear(
            @PathVariable Long areaId,
            @Valid @RequestBody ActividadRequest request,
            Authentication authentication) {
        return actividadService.crear(areaId, request, authentication);
    }

    @GetMapping("/actividades")
    public List<ActividadDto> listar(@PathVariable Long areaId, Authentication authentication) {
        return actividadService.listar(areaId, authentication);
    }

    @DeleteMapping("/actividades/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(
            @PathVariable Long areaId, @PathVariable Long id, Authentication authentication) {
        actividadService.eliminar(areaId, id, authentication);
    }

    /** Grilla estudiantes × actividades. Solo el dueño del espacio la ve. */
    @GetMapping("/tablero")
    public TableroDto tablero(@PathVariable Long areaId, Authentication authentication) {
        return actividadService.tablero(areaId, authentication);
    }
}
