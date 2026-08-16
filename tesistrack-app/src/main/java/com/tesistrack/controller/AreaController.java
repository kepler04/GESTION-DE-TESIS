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

import com.tesistrack.dto.AreaDto;
import com.tesistrack.dto.AreaRequest;
import com.tesistrack.dto.InvitacionDto;
import com.tesistrack.service.AreaService;
import com.tesistrack.service.LimitadorConsultas;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/areas")
public class AreaController {

    private final AreaService areaService;
    private final LimitadorConsultas limitador;

    public AreaController(AreaService areaService, LimitadorConsultas limitador) {
        this.areaService = areaService;
        this.limitador = limitador;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AreaDto crear(@Valid @RequestBody AreaRequest request, Authentication authentication) {
        return areaService.crear(request, authentication);
    }

    /** Solo devuelve las áreas del usuario autenticado. */
    @GetMapping
    public List<AreaDto> listar(Authentication authentication) {
        return areaService.listar(authentication);
    }

    @PutMapping("/{id}")
    public AreaDto renombrar(
            @PathVariable Long id,
            @Valid @RequestBody AreaRequest request,
            Authentication authentication) {
        return areaService.renombrar(id, request, authentication);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id, Authentication authentication) {
        areaService.eliminar(id, authentication);
    }

    /** Cambia el código de invitación, por si el anterior se filtró. */
    @PostMapping("/{id}/codigo")
    public AreaDto regenerarCodigo(@PathVariable Long id, Authentication authentication) {
        return areaService.regenerarCodigo(id, authentication);
    }

    /**
     * A quién y a qué espacio entra un estudiante con este código, para que lo vea
     * antes de confirmar.
     *
     * Limitado por IP: sin eso, se podrían probar códigos en masa hasta acertar uno
     * y colarse en el espacio de un asesor ajeno.
     */
    @GetMapping("/invitacion/{codigo}")
    public InvitacionDto invitacion(@PathVariable String codigo, HttpServletRequest request) {
        limitador.registrarUso("invitacion:" + request.getRemoteAddr());
        return InvitacionDto.from(areaService.buscarPorCodigo(codigo));
    }
}
