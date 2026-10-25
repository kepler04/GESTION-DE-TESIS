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

import com.tesistrack.dto.CandidatoDto;
import com.tesistrack.dto.GrupoAbiertoDto;
import com.tesistrack.dto.InvitacionGrupoDto;
import com.tesistrack.dto.InvitarRequest;
import com.tesistrack.dto.ProyectoDto;
import com.tesistrack.dto.UnirseRequest;
import com.tesistrack.service.GrupoService;
import com.tesistrack.service.LimitadorConsultas;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

/** Grupos de una clase e invitaciones (Decisiones 30 y 31). */
@RestController
@RequestMapping("/api")
public class GrupoController {

    private final GrupoService grupoService;
    private final LimitadorConsultas limitador;

    public GrupoController(GrupoService grupoService, LimitadorConsultas limitador) {
        this.grupoService = grupoService;
        this.limitador = limitador;
    }

    /**
     * Los grupos abiertos de la clase de un código. Comparte el límite por IP de
     * {@code /areas/invitacion/{codigo}}: es otra forma de probar códigos.
     */
    @GetMapping("/areas/invitacion/{codigo}/grupos")
    public List<GrupoAbiertoDto> gruposAbiertos(
            @PathVariable String codigo, HttpServletRequest request, Authentication authentication) {
        limitador.registrarUso("invitacion:" + request.getRemoteAddr());
        return grupoService.gruposAbiertos(codigo, authentication);
    }

    @PostMapping("/proyectos/{id}/unirme")
    public ProyectoDto unirme(
            @PathVariable Long id, @Valid @RequestBody UnirseRequest request, Authentication authentication) {
        return grupoService.unirme(id, request, authentication);
    }

    @GetMapping("/proyectos/{id}/candidatos")
    public List<CandidatoDto> candidatos(@PathVariable Long id, Authentication authentication) {
        return grupoService.candidatos(id, authentication);
    }

    @GetMapping("/proyectos/{id}/invitaciones")
    public List<InvitacionGrupoDto> enviadas(@PathVariable Long id, Authentication authentication) {
        return grupoService.enviadas(id, authentication);
    }

    @PostMapping("/proyectos/{id}/invitaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public InvitacionGrupoDto invitar(
            @PathVariable Long id, @Valid @RequestBody InvitarRequest request, Authentication authentication) {
        return grupoService.invitar(id, request, authentication);
    }

    @GetMapping("/invitaciones")
    public List<InvitacionGrupoDto> recibidas(Authentication authentication) {
        return grupoService.recibidas(authentication);
    }

    @PostMapping("/invitaciones/{id}/aceptar")
    public ProyectoDto aceptar(@PathVariable Long id, Authentication authentication) {
        return grupoService.aceptar(id, authentication);
    }

    @DeleteMapping("/invitaciones/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void descartar(@PathVariable Long id, Authentication authentication) {
        grupoService.descartar(id, authentication);
    }
}
