package com.tesistrack.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tesistrack.dto.ContactoDto;
import com.tesistrack.dto.ConversacionDto;
import com.tesistrack.dto.HiloDto;
import com.tesistrack.dto.MensajeDto;
import com.tesistrack.dto.MensajeRequest;
import com.tesistrack.service.MensajeService;

import jakarta.validation.Valid;

/** Mensajes privados uno a uno (Decisión 28). */
@RestController
@RequestMapping("/api/mensajes")
public class MensajeController {

    private final MensajeService mensajeService;

    public MensajeController(MensajeService mensajeService) {
        this.mensajeService = mensajeService;
    }

    @GetMapping("/contactos")
    public List<ContactoDto> contactos(Authentication authentication) {
        return mensajeService.contactos(authentication);
    }

    @GetMapping("/conversaciones")
    public List<ConversacionDto> conversaciones(Authentication authentication) {
        return mensajeService.conversaciones(authentication);
    }

    @GetMapping("/no-leidos")
    public Map<String, Long> noLeidos(Authentication authentication) {
        return Map.of("total", mensajeService.noLeidos(authentication));
    }

    @GetMapping("/con/{usuarioId}")
    public HiloDto hilo(@PathVariable Long usuarioId, Authentication authentication) {
        return mensajeService.hilo(usuarioId, authentication);
    }

    @PostMapping("/con/{usuarioId}")
    @ResponseStatus(HttpStatus.CREATED)
    public MensajeDto enviar(
            @PathVariable Long usuarioId,
            @Valid @RequestBody MensajeRequest request,
            Authentication authentication) {
        return mensajeService.enviar(usuarioId, request, authentication);
    }

    /** Leer no es un GET: abrir la conversación no marca nada hasta que el frontend lo pide. */
    @PutMapping("/con/{usuarioId}/leidos")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void marcarLeidos(@PathVariable Long usuarioId, Authentication authentication) {
        mensajeService.marcarLeidos(usuarioId, authentication);
    }
}
