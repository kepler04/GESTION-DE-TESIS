package com.tesistrack.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tesistrack.dto.AsesoradoDto;
import com.tesistrack.service.AsesoradoService;

@RestController
@RequestMapping("/api/asesorados")
public class AsesoradoController {

    private final AsesoradoService asesoradoService;

    public AsesoradoController(AsesoradoService asesoradoService) {
        this.asesoradoService = asesoradoService;
    }

    @GetMapping
    public List<AsesoradoDto> listar(Authentication authentication) {
        return asesoradoService.listar(authentication);
    }
}
